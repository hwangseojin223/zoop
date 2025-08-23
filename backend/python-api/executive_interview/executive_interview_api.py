import os
import json
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

from executive_interview_service import ExecutiveInterviewService
from langgraph_workflow import executive_interview_workflow

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Executive Interview AI Analysis API",
    description="임원면접 AI 분석을 위한 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 인스턴스 생성
executive_interview_service = ExecutiveInterviewService()

# Pydantic 모델들
class InterviewAnalysisRequest(BaseModel):
    job_candidate_id: int
    post_id: int
    job_description: str
    candidate_profile: str
    interview_recording_url: Optional[str] = None
    s3_key: Optional[str] = None  # S3 객체 키

class InterviewAnalysisResponse(BaseModel):
    success: bool
    analysis_result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    workflow_status: Optional[str] = None

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    status: str
    progress: float
    current_step: str
    result: Optional[Dict[str, Any]] = None

# Spring Boot 백엔드 API URL
SPRING_API_BASE_URL = os.getenv("SPRING_API_BASE_URL", "http://localhost:8080")

# AWS S3 설정
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

# S3 클라이언트 초기화
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "message": "Executive Interview AI Analysis API",
        "status": "running",
        "version": "1.0.0"
    }

@app.post("/analyze-interview", response_model=InterviewAnalysisResponse)
async def analyze_interview(request: InterviewAnalysisRequest):
    """
    임원면접 AI 분석 수행
    
    Args:
        request: 면접 분석 요청 데이터
        
    Returns:
        분석 결과
    """
    try:
        logger.info(f"임원면접 AI 분석 시작: job_candidate_id={request.job_candidate_id}")
        
        # 1. LangGraph 워크플로우 실행
        initial_state = {
            "job_candidate_id": request.job_candidate_id,
            "post_id": request.post_id,
            "job_description": request.job_description,
            "candidate_profile": request.candidate_profile,
            "interview_recording_url": request.interview_recording_url,
            "s3_key": request.s3_key  # S3 키 추가
        }
        
        workflow_result = executive_interview_workflow.run_workflow(initial_state)
        
        if "error" in workflow_result:
            logger.error(f"워크플로우 실행 실패: {workflow_result['error']}")
            raise HTTPException(status_code=500, detail=workflow_result["error"])
        
        # 2. 분석 결과 추출
        analysis_result = workflow_result.get("ai_analysis", {})
        final_recommendation = workflow_result.get("final_recommendation", {})
        
        # 3. Spring Boot 백엔드에 결과 저장
        analysis_data = {
            "job_candidate_id": request.job_candidate_id,
            "post_id": request.post_id,
            "analysis_data": json.dumps(workflow_result, ensure_ascii=False),
            "analysis_score": final_recommendation.get("overall_score", 5.0)
        }
        
        # Spring Boot API 호출하여 분석 결과 저장
        save_response = await save_analysis_to_spring(analysis_data)
        
        if not save_response.get("success", False):
            logger.warning("Spring Boot에 분석 결과 저장 실패")
        
        # 4. 응답 구성
        response_data = {
            "success": True,
            "analysis_result": {
                "workflow_result": workflow_result,
                "ai_analysis": analysis_result,
                "final_recommendation": final_recommendation,
                "saved_to_spring": save_response.get("success", False)
            },
            "workflow_status": "completed"
        }
        
        logger.info(f"임원면접 AI 분석 완료: job_candidate_id={request.job_candidate_id}")
        return InterviewAnalysisResponse(**response_data)
        
    except Exception as e:
        logger.error(f"임원면접 AI 분석 실패: {str(e)}")
        return InterviewAnalysisResponse(
            success=False,
            error=f"분석 실패: {str(e)}"
        )

@app.post("/analyze-interview-s3")
async def analyze_interview_from_s3(
    job_candidate_id: int,
    post_id: int,
    job_description: str,
    candidate_profile: str,
    s3_key: str
):
    """
    S3에 저장된 면접 녹화 파일을 분석
    
    Args:
        job_candidate_id: 지원자 ID
        post_id: 공고 ID
        job_description: 채용 공고 내용
        candidate_profile: 지원자 프로필
        s3_key: S3 객체 키
        
    Returns:
        분석 결과
    """
    try:
        logger.info(f"S3 기반 임원면접 AI 분석 시작: job_candidate_id={job_candidate_id}, s3_key={s3_key}")
        
        # 1. LangGraph 워크플로우 실행 (S3 키 포함)
        initial_state = {
            "job_candidate_id": job_candidate_id,
            "post_id": post_id,
            "job_description": job_description,
            "candidate_profile": candidate_profile,
            "s3_key": s3_key
        }
        
        workflow_result = executive_interview_workflow.run_workflow(initial_state)
        
        if "error" in workflow_result:
            logger.error(f"워크플로우 실행 실패: {workflow_result['error']}")
            raise HTTPException(status_code=500, detail=workflow_result["error"])
        
        # 2. 분석 결과 추출
        analysis_result = workflow_result.get("ai_analysis", {})
        final_recommendation = workflow_result.get("final_recommendation", {})
        
        # 3. Spring Boot 백엔드에 결과 저장
        analysis_data = {
            "job_candidate_id": job_candidate_id,
            "post_id": post_id,
            "analysis_data": json.dumps(workflow_result, ensure_ascii=False),
            "analysis_score": final_recommendation.get("overall_score", 5.0)
        }
        
        save_response = await save_analysis_to_spring(analysis_data)
        
        # 4. 응답 구성
        response_data = {
            "success": True,
            "analysis_result": {
                "workflow_result": workflow_result,
                "ai_analysis": analysis_result,
                "final_recommendation": final_recommendation,
                "saved_to_spring": save_response.get("success", False),
                "audio_processing": {
                    "success": workflow_result.get("audio_processing_success", False),
                    "transcript_length": len(workflow_result.get("transcript", "")),
                    "speaker_count": workflow_result.get("speaker_count", 0),
                    "recording_duration": workflow_result.get("recording_duration", "0초")
                }
            },
            "workflow_status": "completed"
        }
        
        logger.info(f"S3 기반 임원면접 AI 분석 완료: job_candidate_id={job_candidate_id}")
        return response_data
        
    except Exception as e:
        logger.error(f"S3 기반 임원면접 AI 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")

@app.post("/analyze-interview-file")
async def analyze_interview_with_file(
    job_candidate_id: int = Form(...),
    post_id: int = Form(...),
    job_description: str = Form(...),
    candidate_profile: str = Form(...),
    interview_file: UploadFile = File(...)
):
    """
    면접 녹화 파일을 업로드하여 AI 분석 수행
    
    Args:
        job_candidate_id: 지원자 ID
        post_id: 공고 ID
        job_description: 채용 공고 내용
        candidate_profile: 지원자 프로필
        interview_file: 면접 녹화 파일
        
    Returns:
        분석 결과
    """
    try:
        logger.info(f"파일 업로드 임원면접 AI 분석 시작: job_candidate_id={job_candidate_id}")
        
        # 파일 검증
        if not interview_file.filename:
            raise HTTPException(status_code=400, detail="파일이 업로드되지 않았습니다.")
        
        # 파일 확장자 검증
        allowed_extensions = [".mp3", ".wav", ".m4a", ".mp4"]
        file_extension = os.path.splitext(interview_file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(allowed_extensions)}"
            )
        
        # 파일 저장 (실제 구현에서는 클라우드 스토리지 사용)
        file_path = f"/tmp/{interview_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await interview_file.read()
            buffer.write(content)
        
        # 1. LangGraph 워크플로우 실행 (파일 경로 포함)
        initial_state = {
            "job_candidate_id": job_candidate_id,
            "post_id": post_id,
            "job_description": job_description,
            "candidate_profile": candidate_profile,
            "interview_file_path": file_path,
            "file_uploaded": True
        }
        
        workflow_result = executive_interview_workflow.run_workflow(initial_state)
        
        if "error" in workflow_result:
            logger.error(f"워크플로우 실행 실패: {workflow_result['error']}")
            raise HTTPException(status_code=500, detail=workflow_result["error"])
        
        # 2. 분석 결과 추출
        analysis_result = workflow_result.get("ai_analysis", {})
        final_recommendation = workflow_result.get("final_recommendation", {})
        
        # 3. Spring Boot 백엔드에 결과 저장
        analysis_data = {
            "job_candidate_id": job_candidate_id,
            "post_id": post_id,
            "analysis_data": json.dumps(workflow_result, ensure_ascii=False),
            "analysis_score": final_recommendation.get("overall_score", 5.0)
        }
        
        save_response = await save_analysis_to_spring(analysis_data)
        
        # 4. 임시 파일 삭제
        try:
            os.remove(file_path)
        except:
            pass
        
        # 5. 응답 구성
        response_data = {
            "success": True,
            "analysis_result": {
                "workflow_result": workflow_result,
                "ai_analysis": analysis_result,
                "final_recommendation": final_recommendation,
                "saved_to_spring": save_response.get("success", False)
            },
            "workflow_status": "completed"
        }
        
        logger.info(f"파일 업로드 임원면접 AI 분석 완료: job_candidate_id={job_candidate_id}")
        return response_data
        
    except Exception as e:
        logger.error(f"파일 업로드 임원면접 AI 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")

@app.get("/workflow-status/{workflow_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str):
    """
    워크플로우 상태 조회
    
    Args:
        workflow_id: 워크플로우 ID
        
    Returns:
        워크플로우 상태 정보
    """
    try:
        # 실제 구현에서는 Redis나 데이터베이스에서 상태 조회
        # 여기서는 시뮬레이션된 상태 반환
        mock_status = {
            "workflow_id": workflow_id,
            "status": "completed",
            "progress": 100.0,
            "current_step": "final_recommendation",
            "result": {
                "message": "워크플로우가 성공적으로 완료되었습니다."
            }
        }
        
        return WorkflowStatusResponse(**mock_status)
        
    except Exception as e:
        logger.error(f"워크플로우 상태 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"상태 조회 실패: {str(e)}")

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "executive_interview_api"}

@app.post("/upload-recording")
async def upload_interview_recording(
    file: UploadFile = File(...),
    candidate_id: str = Form(...),
    post_id: str = Form(...),
    interview_type: str = Form(...)
):
    """
    면접 녹화 파일을 S3에 업로드
    
    Args:
        file: 업로드할 비디오 파일
        candidate_id: 지원자 ID
        post_id: 공고 ID
        interview_type: 면접 유형
        
    Returns:
        업로드 결과 (S3 키 포함)
    """
    try:
        logger.info(f"면접 녹화 파일 S3 업로드 시작: {file.filename}")
        
        # 파일 검증
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일이 업로드되지 않았습니다.")
        
        # 지원되는 비디오 형식 검증
        allowed_extensions = [".mp4", ".webm", ".avi", ".mov", ".mkv"]
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(allowed_extensions)}"
            )
        
        # S3 키 생성
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        s3_key = f"executive_interviews/{post_id}/{candidate_id}_{timestamp}{file_extension}"
        
        # 파일 내용 읽기
        file_content = await file.read()
        
        # S3에 업로드
        try:
            s3_client.put_object(
                Bucket=AWS_S3_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type,
                Metadata={
                    'candidate_id': candidate_id,
                    'post_id': post_id,
                    'interview_type': interview_type,
                    'upload_timestamp': timestamp,
                    'original_filename': file.filename
                }
            )
            
            logger.info(f"면접 녹화 파일 S3 업로드 완료: {s3_key}")
            
            return {
                "success": True,
                "s3_key": s3_key,
                "bucket": AWS_S3_BUCKET,
                "filename": file.filename,
                "file_size": len(file_content),
                "content_type": file.content_type
            }
            
        except ClientError as e:
            logger.error(f"S3 업로드 실패: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 업로드 실패: {str(e)}")
            
    except Exception as e:
        logger.error(f"면접 녹화 파일 업로드 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"업로드 실패: {str(e)}")

@app.get("/audio-processing-status")
async def get_audio_processing_status():
    """음성 처리 서비스 상태 확인"""
    try:
        # 음성 처리 서비스 상태 확인
        from audio_processing_service import AudioProcessingService
        audio_service = AudioProcessingService()
        
        status = {
            "whisper_model": "loaded" if audio_service.whisper_model else "not_loaded",
            "pyannote_pipeline": "loaded" if audio_service.speaker_pipeline else "not_loaded",
            "s3_client": "configured" if audio_service.s3_client else "not_configured",
            "s3_bucket": audio_service.bucket_name or "not_configured",
            "aws_region": os.getenv("AWS_REGION", "not_configured")
        }
        
        return {
            "status": "healthy",
            "audio_processing": status
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

async def save_analysis_to_spring(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Spring Boot 백엔드에 분석 결과 저장
    
    Args:
        analysis_data: 저장할 분석 데이터
        
    Returns:
        저장 결과
    """
    try:
        url = f"{SPRING_API_BASE_URL}/api/executive-interview/analysis"
        
        response = requests.post(
            url,
            json=analysis_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info("Spring Boot에 분석 결과 저장 성공")
            return {"success": True, "response": response.json()}
        else:
            logger.warning(f"Spring Boot 저장 실패: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
            
    except Exception as e:
        logger.error(f"Spring Boot 저장 중 오류: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    
    # 서버 실행
    uvicorn.run(
        "executive_interview_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 