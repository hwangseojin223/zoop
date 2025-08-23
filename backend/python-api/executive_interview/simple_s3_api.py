import os
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from datetime import datetime
import httpx

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Simple S3 Upload API",
    description="면접 녹화 파일을 S3에 업로드하는 간단한 API",
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

# Spring Boot 백엔드 API URL
SPRING_API_BASE_URL = os.getenv("SPRING_API_BASE_URL", "http://localhost:8081")

async def save_recording_result_to_spring(candidate_id: str, post_id: str, interview_type: str,
                                        s3_key: str, s3_url: str, filename: str, file_size: int,
                                        content_type: str, recording_duration: int = None, 
                                        company_admin_id: str = None):
    """
    Spring Boot 백엔드에 면접 녹화 결과 저장
    """
    try:
        data = {
            "candidate_id": candidate_id,
            "post_id": post_id,
            "interview_type": interview_type,
            "s3_key": s3_key,
            "s3_url": s3_url,
            "filename": filename,
            "file_size": file_size,
            "content_type": content_type,
            "recording_duration": recording_duration,
            "company_admin_id": company_admin_id
        }
        
        logger.info(f"Spring Boot 백엔드로 결과 전송: {data}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SPRING_API_BASE_URL}/api/executive-interview/save-recording-result",
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Spring Boot 백엔드 저장 성공: {result}")
                return result
            else:
                logger.error(f"Spring Boot 백엔드 저장 실패: {response.status_code} - {response.text}")
                raise Exception(f"Spring Boot API 오류: {response.status_code}")
                
    except Exception as e:
        logger.error(f"Spring Boot 백엔드 저장 중 오류: {str(e)}")
        raise e

@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "message": "Simple S3 Upload API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "simple_s3_api"}

@app.post("/upload-recording")
async def upload_interview_recording(
    file: UploadFile = File(...),
    candidate_id: str = Form(...),
    post_id: str = Form(...),
    interview_type: str = Form(...),
    user_type: str = Form("unknown"),
    recording_duration: str = Form(None),
    company_admin_id: str = Form(None)
):
    """
    면접 녹화 파일을 S3에 업로드
    
    Args:
        file: 업로드할 비디오 파일
        candidate_id: 지원자 ID
        post_id: 공고 ID
        interview_type: 면접 유형
        user_type: 사용자 타입 (candidate, company 등)
        
    Returns:
        업로드 결과 (S3 키 포함)
    """
    try:
        logger.info(f"면접 녹화 파일 S3 업로드 시작: {file.filename}")
        logger.info(f"파일 정보: size={file.size}, content_type={file.content_type}")
        logger.info(f"업로드 파라미터: candidate_id={candidate_id}, post_id={post_id}, interview_type={interview_type}, user_type={user_type}")
        logger.info(f"추가 파라미터: recording_duration={recording_duration}, company_admin_id={company_admin_id}")

        # 파일 검증
        if not file.filename:
            logger.error("파일명이 없습니다")
            raise HTTPException(status_code=400, detail="파일이 업로드되지 않았습니다.")

        if not file.size or file.size == 0:
            logger.error(f"파일 크기가 0입니다: {file.size}")
            raise HTTPException(status_code=400, detail="파일 크기가 0입니다.")

        # 지원되는 비디오 형식 검증
        allowed_extensions = [".mp4", ".webm", ".avi", ".mov", ".mkv"]
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            logger.error(f"지원하지 않는 파일 형식: {file_extension}")
            raise HTTPException(
                status_code=400,
                detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(allowed_extensions)}"
            )

        # candidate_id와 post_id 검증
        if not candidate_id or candidate_id == "unknown":
            logger.error(f"유효하지 않은 candidate_id: {candidate_id}")
            raise HTTPException(status_code=400, detail="유효한 지원자 ID가 필요합니다.")

        if not post_id or post_id == "unknown":
            logger.error(f"유효하지 않은 post_id: {post_id}")
            raise HTTPException(status_code=400, detail="유효한 공고 ID가 필요합니다.")

        # S3 키 생성 - executive_interview 폴더에 저장
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        s3_key = f"executive_interview/{post_id}/{candidate_id}_{timestamp}{file_extension}"

        logger.info(f"S3 키 생성: {s3_key}")

        # 파일 내용 읽기
        try:
            logger.info(f"파일 읽기 시작: {file.filename}")
            file_content = await file.read()
            logger.info(f"파일 내용 읽기 완료: {len(file_content)} bytes")

            if not file_content:
                logger.error("파일 내용이 비어있습니다")
                raise HTTPException(status_code=400, detail="파일 내용을 읽을 수 없습니다.")

            # 파일 크기 재검증
            if len(file_content) == 0:
                logger.error("파일 내용 길이가 0입니다")
                raise HTTPException(status_code=400, detail="파일 내용이 비어있습니다.")

        except Exception as read_error:
            logger.error(f"파일 읽기 실패: {str(read_error)}")
            raise HTTPException(status_code=400, detail=f"파일 읽기 실패: {str(read_error)}")

        # S3에 업로드
        try:
            logger.info(f"S3 업로드 시작: bucket={AWS_S3_BUCKET}, key={s3_key}")

            s3_client.put_object(
                Bucket=AWS_S3_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type or 'application/octet-stream',
                Metadata={
                    'candidate_id': candidate_id,
                    'post_id': post_id,
                    'interview_type': interview_type,
                    'user_type': user_type,
                    'upload_timestamp': timestamp,
                    'original_filename': file.filename
                }
            )

            logger.info(f"면접 녹화 파일 S3 업로드 완료: {s3_key}")

            # Spring Boot 백엔드로 결과 전송하여 DB에 저장
            try:
                await save_recording_result_to_spring(
                    candidate_id=candidate_id,
                    post_id=post_id,
                    interview_type=interview_type,
                    s3_key=s3_key,
                    s3_url=f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}",
                    filename=file.filename,
                    file_size=len(file_content),
                    content_type=file.content_type or 'application/octet-stream',
                    recording_duration=int(recording_duration) if recording_duration else None,
                    company_admin_id=company_admin_id if company_admin_id != 'unknown' else None
                )
                logger.info("Spring Boot 백엔드에 결과 저장 완료")
            except Exception as save_error:
                logger.warning(f"Spring Boot 백엔드 저장 실패: {str(save_error)}")
                # S3 업로드는 성공했지만 DB 저장은 실패한 경우

            return {
                "success": True,
                "s3_key": s3_key,
                "bucket": AWS_S3_BUCKET,
                "filename": file.filename,
                "file_size": len(file_content),
                "content_type": file.content_type or 'application/octet-stream',
                "s3_url": f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            }

        except ClientError as e:
            logger.error(f"S3 업로드 실패: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 업로드 실패: {str(e)}")

    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        logger.error(f"면접 녹화 파일 업로드 실패: {str(e)}")
        logger.error(f"오류 타입: {type(e)}")
        import traceback
        logger.error(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"업로드 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006) 