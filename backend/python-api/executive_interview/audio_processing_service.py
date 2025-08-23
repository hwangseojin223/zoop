import os
import tempfile
import logging
from typing import Dict, Any, Tuple, List
import boto3
from botocore.exceptions import ClientError
import whisper
import torch
from pyannote.audio import Pipeline
from pyannote.audio.pipelines.utils.hook import ProgressHook
import ffmpeg
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioProcessingService:
    """
    AWS S3 음성 파일 처리 서비스
    - S3에서 음성 파일 다운로드
    - Whisper로 음성-텍스트 변환
    - Pyannote.audio로 화자 분리
    """
    
    def __init__(self):
        # AWS S3 클라이언트 초기화
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-northeast-2')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET')
        
        # Whisper 모델 로드
        self.whisper_model = whisper.load_model(
            os.getenv('WHISPER_MODEL', 'base')
        )
        
        # Pyannote.audio 파이프라인 초기화
        self.pyannote_auth_token = os.getenv('PYANNOTE_AUTH_TOKEN')
        if self.pyannote_auth_token:
            try:
                self.speaker_pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization@2.1",
                    use_auth_token=self.pyannote_auth_token
                )
                logger.info("Pyannote.audio 파이프라인 로드 완료")
            except Exception as e:
                logger.error(f"Pyannote.audio 파이프라인 로드 실패: {str(e)}")
                self.speaker_pipeline = None
        else:
            logger.warning("PYANNOTE_AUTH_TOKEN이 설정되지 않았습니다. 화자 분리를 사용할 수 없습니다.")
            self.speaker_pipeline = None
    
    def download_from_s3(self, s3_key: str) -> str:
        """
        S3에서 음성 파일 다운로드
        
        Args:
            s3_key: S3 객체 키
            
        Returns:
            다운로드된 파일의 로컬 경로
        """
        try:
            logger.info(f"S3에서 파일 다운로드 시작: {s3_key}")
            
            # 임시 파일 생성
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file_path = temp_file.name
            temp_file.close()
            
            # S3에서 파일 다운로드
            self.s3_client.download_file(
                self.bucket_name, 
                s3_key, 
                temp_file_path
            )
            
            logger.info(f"S3 파일 다운로드 완료: {temp_file_path}")
            return temp_file_path
            
        except ClientError as e:
            logger.error(f"S3 다운로드 실패: {str(e)}")
            raise Exception(f"S3 파일 다운로드 실패: {str(e)}")
        except Exception as e:
            logger.error(f"파일 다운로드 중 오류: {str(e)}")
            raise
    
    def convert_to_wav(self, input_path: str) -> str:
        """
        음성 파일을 WAV 형식으로 변환 (Whisper 호환성)
        
        Args:
            input_path: 입력 파일 경로
            
        Returns:
            변환된 WAV 파일 경로
        """
        try:
            logger.info(f"WAV 형식 변환 시작: {input_path}")
            
            # 출력 파일 경로 생성
            output_path = input_path.rsplit('.', 1)[0] + '.wav'
            
            # ffmpeg로 변환
            stream = ffmpeg.input(input_path)
            stream = ffmpeg.output(stream, output_path, acodec='pcm_s16le', ac=1, ar='16000')
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            logger.info(f"WAV 형식 변환 완료: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"WAV 변환 실패: {str(e)}")
            # 변환 실패 시 원본 파일 반환
            return input_path
    
    def extract_text_with_whisper(self, audio_path: str) -> str:
        """
        Whisper를 사용하여 음성에서 텍스트 추출
        
        Args:
            audio_path: 음성 파일 경로
            
        Returns:
            추출된 텍스트
        """
        try:
            logger.info(f"Whisper 텍스트 추출 시작: {audio_path}")
            
            # Whisper로 음성 인식
            result = self.whisper_model.transcribe(
                audio_path,
                language="ko",  # 한국어
                task="transcribe"
            )
            
            extracted_text = result["text"]
            logger.info(f"Whisper 텍스트 추출 완료: {len(extracted_text)} 문자")
            
            return extracted_text
            
        except Exception as e:
            logger.error(f"Whisper 텍스트 추출 실패: {str(e)}")
            raise Exception(f"음성 인식 실패: {str(e)}")
    
    def separate_speakers(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        Pyannote.audio를 사용하여 화자 분리
        
        Args:
            audio_path: 음성 파일 경로
            
        Returns:
            화자별 세그먼트 정보 리스트
        """
        try:
            if not self.speaker_pipeline:
                logger.warning("Pyannote.audio 파이프라인이 로드되지 않았습니다.")
                return []
            
            logger.info(f"화자 분리 시작: {audio_path}")
            
            # 화자 분리 수행
            diarization = self.speaker_pipeline(audio_path)
            
            # 결과 파싱
            speaker_segments = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                segment = {
                    "start": turn.start,
                    "end": turn.end,
                    "speaker": speaker,
                    "duration": turn.end - turn.start
                }
                speaker_segments.append(segment)
            
            logger.info(f"화자 분리 완료: {len(speaker_segments)}개 세그먼트")
            return speaker_segments
            
        except Exception as e:
            logger.error(f"화자 분리 실패: {str(e)}")
            return []
    
    def create_speaker_transcript(self, audio_path: str) -> str:
        """
        화자 분리와 텍스트 추출을 결합하여 화자별 대화 내용 생성
        
        Args:
            audio_path: 음성 파일 경로
            
        Returns:
            화자별로 구분된 대화 내용
        """
        try:
            logger.info("화자별 대화 내용 생성 시작")
            
            # 1. 화자 분리
            speaker_segments = self.separate_speakers(audio_path)
            
            if not speaker_segments:
                logger.warning("화자 분리를 수행할 수 없습니다. 전체 텍스트만 반환합니다.")
                return self.extract_text_with_whisper(audio_path)
            
            # 2. 각 세그먼트별로 텍스트 추출
            transcript_parts = []
            
            for i, segment in enumerate(speaker_segments):
                start_time = segment["start"]
                end_time = segment["end"]
                speaker = segment["speaker"]
                
                # 세그먼트별로 오디오 파일 분할
                segment_audio_path = self.extract_audio_segment(
                    audio_path, start_time, end_time
                )
                
                # 해당 세그먼트의 텍스트 추출
                try:
                    segment_text = self.extract_text_with_whisper(segment_audio_path)
                    if segment_text.strip():
                        transcript_parts.append(f"[{speaker}] {segment_text}")
                    
                    # 임시 세그먼트 파일 삭제
                    os.remove(segment_audio_path)
                    
                except Exception as e:
                    logger.warning(f"세그먼트 {i} 텍스트 추출 실패: {str(e)}")
                    continue
            
            # 3. 전체 대화 내용 조합
            full_transcript = "\n".join(transcript_parts)
            
            logger.info("화자별 대화 내용 생성 완료")
            return full_transcript
            
        except Exception as e:
            logger.error(f"화자별 대화 내용 생성 실패: {str(e)}")
            # 실패 시 전체 텍스트만 반환
            return self.extract_text_with_whisper(audio_path)
    
    def extract_audio_segment(self, audio_path: str, start_time: float, end_time: float) -> str:
        """
        오디오 파일에서 특정 시간 구간 추출
        
        Args:
            audio_path: 원본 오디오 파일 경로
            start_time: 시작 시간 (초)
            end_time: 종료 시간 (초)
            
        Returns:
            추출된 세그먼트 파일 경로
        """
        try:
            # 임시 파일 생성
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file_path = temp_file.name
            temp_file.close()
            
            # ffmpeg로 세그먼트 추출
            stream = ffmpeg.input(audio_path, ss=start_time, t=end_time-start_time)
            stream = ffmpeg.output(stream, temp_file_path, acodec='pcm_s16le', ac=1, ar='16000')
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            return temp_file_path
            
        except Exception as e:
            logger.error(f"오디오 세그먼트 추출 실패: {str(e)}")
            raise
    
    def process_interview_audio(self, s3_key: str) -> Dict[str, Any]:
        """
        S3 음성 파일을 처리하여 텍스트와 화자 정보 추출
        
        Args:
            s3_key: S3 객체 키
            
        Returns:
            처리 결과 딕셔너리
        """
        temp_files = []
        
        try:
            logger.info(f"면접 음성 파일 처리 시작: {s3_key}")
            
            # 1. S3에서 파일 다운로드
            audio_path = self.download_from_s3(s3_key)
            temp_files.append(audio_path)
            
            # 2. WAV 형식으로 변환
            wav_path = self.convert_to_wav(audio_path)
            if wav_path != audio_path:
                temp_files.append(wav_path)
            
            # 3. 화자별 대화 내용 생성
            transcript = self.create_speaker_transcript(wav_path)
            
            # 4. 화자 분리 정보
            speaker_segments = self.separate_speakers(wav_path)
            
            # 5. 결과 구성
            result = {
                "transcript": transcript,
                "speaker_segments": speaker_segments,
                "total_duration": speaker_segments[-1]["end"] if speaker_segments else 0,
                "speaker_count": len(set(seg["speaker"] for seg in speaker_segments)),
                "processing_status": "completed"
            }
            
            logger.info("면접 음성 파일 처리 완료")
            return result
            
        except Exception as e:
            logger.error(f"면접 음성 파일 처리 실패: {str(e)}")
            return {
                "error": str(e),
                "processing_status": "failed"
            }
        
        finally:
            # 임시 파일 정리
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                except Exception as e:
                    logger.warning(f"임시 파일 삭제 실패: {temp_file}, {str(e)}")
    
    def cleanup_temp_files(self):
        """임시 파일 정리"""
        try:
            temp_dir = tempfile.gettempdir()
            for filename in os.listdir(temp_dir):
                if filename.startswith('tmp') and filename.endswith('.wav'):
                    file_path = os.path.join(temp_dir, filename)
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
        except Exception as e:
            logger.warning(f"임시 파일 정리 실패: {str(e)}") 