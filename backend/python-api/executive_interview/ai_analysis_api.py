import os
import logging
import json
import asyncio
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import httpx
import whisper
# 의존성 충돌 방지를 위해 임시로 주석 처리
# from pyannote.audio import Pipeline
# from pyannote.audio.pipelines.utils.hook import ProgressHook
import torch

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="AI Analysis API",
    description="면접 녹화 파일을 Whisper로 텍스트 변환하고 화자 분리하는 API",
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

# Whisper 모델 초기화
whisper_model = None
# pyannote_pipeline = None # 의존성 충돌 방지를 위해 임시로 주석 처리

def load_whisper_model():
    """Whisper 모델 로드"""
    global whisper_model
    if whisper_model is None:
        logger.info("Whisper 모델 로딩 중...")
        whisper_model = whisper.load_model("base")
        logger.info("Whisper 모델 로딩 완료")
    return whisper_model

# def load_pyannote_pipeline(): # 의존성 충돌 방지를 위해 임시로 주석 처리
#     """Pyannote 화자 분리 파이프라인 로드"""
#     global pyannote_pipeline
#     if pyannote_pipeline is None:
#         logger.info("Pyannote 파이프라인 로딩 중...")
#         # HuggingFace 토큰이 필요합니다
#         hf_token = os.getenv("HF_TOKEN")
#         if not hf_token:
#             logger.warning("HF_TOKEN이 설정되지 않았습니다. 화자 분리를 건너뜁니다.")
#             return None
        
#         try:
#             pyannote_pipeline = Pipeline.from_pretrained(
#                 "pyannote/speaker-diarization@2.1",
#                 use_auth_token=hf_token
#             )
#             logger.info("Pyannote 파이프라인 로딩 완료")
#         except Exception as e:
#             logger.error(f"Pyannote 파이프라인 로딩 실패: {e}")
#             return None
#     return pyannote_pipeline

async def download_audio_from_s3(s3_key: str) -> str:
    """S3에서 오디오 파일 다운로드"""
    try:
        local_path = f"/tmp/{os.path.basename(s3_key)}"
        logger.info(f"S3에서 오디오 파일 다운로드: {s3_key} -> {local_path}")
        
        s3_client.download_file(AWS_S3_BUCKET, s3_key, local_path)
        logger.info(f"오디오 파일 다운로드 완료: {local_path}")
        
        return local_path
    except Exception as e:
        logger.error(f"오디오 파일 다운로드 실패: {e}")
        raise HTTPException(status_code=500, detail=f"오디오 파일 다운로드 실패: {str(e)}")

async def transcribe_audio(audio_path: str) -> Dict[str, Any]:
    """Whisper로 오디오를 텍스트로 변환"""
    try:
        logger.info(f"Whisper로 오디오 변환 시작: {audio_path}")
        
        model = load_whisper_model()
        result = model.transcribe(audio_path)
        
        logger.info(f"Whisper 변환 완료: {len(result['text'])} 문자")
        
        return {
            "text": result["text"],
            "segments": result["segments"],
            "language": result["language"]
        }
    except Exception as e:
        logger.error(f"Whisper 변환 실패: {e}")
        raise HTTPException(status_code=500, detail=f"Whisper 변환 실패: {str(e)}")

# async def perform_speaker_diarization(audio_path: str) -> List[Dict[str, Any]]: # 의존성 충돌 방지를 위해 임시로 주석 처리
#     """화자 분리 수행"""
#     try:
#         logger.info(f"화자 분리 시작: {audio_path}")
        
#         pipeline = load_pyannote_pipeline()
#         if pipeline is None:
#             logger.warning("화자 분리 파이프라인을 사용할 수 없습니다.")
#             return []
        
#         # 화자 분리 수행
#         diarization = pipeline(audio_path)
        
#         # 결과를 시간별로 정리
#         speakers = []
#         for turn, _, speaker in diarization.itertracks(yield_label=True):
#             speakers.append({
#                 "speaker": speaker,
#                 "start": turn.start,
#                 "end": turn.end,
#                 "duration": turn.end - turn.start
#             })
        
#         logger.info(f"화자 분리 완료: {len(speakers)}개 세그먼트")
#         return speakers
        
#     except Exception as e:
#         logger.error(f"화자 분리 실패: {e}")
#         logger.warning("화자 분리를 건너뜁니다.")
#         return []

async def save_analysis_result_to_spring(schedule_id: str, transcription: Dict[str, Any], 
                                        s3_key: str) -> Dict[str, Any]:
    """Spring Boot 백엔드에 AI 분석 결과 저장"""
    try:
        data = {
            "schedule_id": schedule_id,
            "analysis_type": "executive_interview",
            "transcription_text": transcription["text"],
            "transcription_segments": transcription["segments"],
            # "speaker_diarization": speakers, # 의존성 충돌 방지를 위해 임시로 주석 처리
            "s3_key": s3_key,
            "language": transcription.get("language", "ko"),
            "analysis_status": "COMPLETED"
        }
        
        logger.info(f"Spring Boot 백엔드로 AI 분석 결과 전송: schedule_id={schedule_id}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SPRING_API_BASE_URL}/api/executive-interview/save-analysis-result",
                json=data,
                timeout=60.0
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

async def update_schedule_status(schedule_id: str, status: str) -> bool:
    """면접 일정 상태 업데이트"""
    try:
        data = {"status": status}
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{SPRING_API_BASE_URL}/api/executive-interview/schedules/{schedule_id}/status",
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                logger.info(f"면접 일정 상태 업데이트 성공: schedule_id={schedule_id}, status={status}")
                return True
            else:
                logger.error(f"면접 일정 상태 업데이트 실패: {response.status_code}")
                return False
                
    except Exception as e:
        logger.error(f"면접 일정 상태 업데이트 중 오류: {str(e)}")
        return False

async def process_interview_analysis(schedule_id: str, s3_key: str):
    """면접 분석 전체 프로세스"""
    try:
        logger.info(f"면접 분석 시작: schedule_id={schedule_id}, s3_key={s3_key}")
        
        # 1. S3에서 오디오 파일 다운로드
        audio_path = await download_audio_from_s3(s3_key)
        
        # 2. Whisper로 텍스트 변환
        transcription = await transcribe_audio(audio_path)
        
        # 3. 화자 분리 (의존성 충돌 방지를 위해 임시로 주석 처리)
        # speakers = await perform_speaker_diarization(audio_path)
        
        # 4. Spring Boot 백엔드에 결과 저장
        await save_analysis_result_to_spring(schedule_id, transcription, s3_key)
        
        # 5. 상태를 COMPLETED로 변경
        await update_schedule_status(schedule_id, "COMPLETED")
        
        # 7. 임시 파일 정리
        try:
            os.remove(audio_path)
            logger.info(f"임시 파일 정리 완료: {audio_path}")
        except Exception as e:
            logger.warning(f"임시 파일 정리 실패: {e}")
        
        logger.info(f"면접 분석 완료: schedule_id={schedule_id}")
        
    except Exception as e:
        logger.error(f"면접 분석 실패: schedule_id={schedule_id}, error={str(e)}")
        # 오류 발생 시 상태를 ERROR로 변경
        await update_schedule_status(schedule_id, "ERROR")
        raise e

@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "message": "AI Analysis API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "ai_analysis_api"}

@app.post("/analyze-interview")
async def analyze_interview(
    schedule_id: str,
    s3_key: str,
    background_tasks: BackgroundTasks
):
    """면접 분석 시작 (백그라운드에서 실행)"""
    try:
        logger.info(f"면접 분석 요청: schedule_id={schedule_id}, s3_key={s3_key}")
        
        # 백그라운드에서 분석 실행
        background_tasks.add_task(process_interview_analysis, schedule_id, s3_key)
        
        return {
            "success": True,
            "message": "면접 분석이 시작되었습니다.",
            "schedule_id": schedule_id,
            "status": "ANALYZING"
        }
        
    except Exception as e:
        logger.error(f"면접 분석 요청 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"면접 분석 요청 실패: {str(e)}")

@app.get("/pending-interviews")
async def get_pending_interviews():
    """PENDING 상태의 면접 일정 조회"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SPRING_API_BASE_URL}/api/executive-interview/schedules?status=PENDING",
                timeout=30.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"PENDING 면접 일정 조회 실패: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"PENDING 면접 일정 조회 중 오류: {str(e)}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007) 