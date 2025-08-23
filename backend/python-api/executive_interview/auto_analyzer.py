import asyncio
import logging
import time
from datetime import datetime
import httpx
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Spring Boot 백엔드 API URL
SPRING_API_BASE_URL = "http://localhost:8081"
AI_ANALYSIS_API_URL = "http://localhost:8007"

class AutoAnalyzer:
    def __init__(self):
        self.running = False
        self.check_interval = 30  # 30초마다 체크
        
    async def start(self):
        """자동 분석 시작"""
        self.running = True
        logger.info("자동 면접 분석 스케줄러 시작")
        
        while self.running:
            try:
                await self.check_pending_interviews()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"자동 분석 중 오류 발생: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def stop(self):
        """자동 분석 중지"""
        self.running = False
        logger.info("자동 면접 분석 스케줄러 중지")
    
    async def check_pending_interviews(self):
        """IN_PROGRESS 상태의 면접 일정 확인"""
        try:
            logger.info("IN_PROGRESS 상태의 면접 일정 확인 중...")
            
            async with httpx.AsyncClient() as client:
                # IN_PROGRESS 상태의 면접 일정 조회
                response = await client.get(
                    f"{SPRING_API_BASE_URL}/api/executive-interview/schedules?status=IN_PROGRESS",
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    schedules = response.json()
                    logger.info(f"IN_PROGRESS 상태의 면접 일정 {len(schedules)}개 발견")
                    
                    for schedule in schedules:
                        await self.process_pending_schedule(schedule)
                else:
                    logger.error(f"면접 일정 조회 실패: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"IN_PROGRESS 면접 일정 확인 실패: {e}")
    
    async def process_pending_schedule(self, schedule):
        """PENDING 상태의 면접 일정 처리"""
        try:
            schedule_id = schedule.get("scheduleId")
            notes = schedule.get("notes", "")
            
            if not schedule_id:
                logger.warning("scheduleId가 없는 면접 일정 건너뛰기")
                return
            
            # notes에서 S3 키 추출
            s3_key = self.extract_s3_key_from_notes(notes)
            if not s3_key:
                logger.warning(f"scheduleId {schedule_id}에서 S3 키를 찾을 수 없음")
                return
            
            logger.info(f"면접 분석 시작: scheduleId={schedule_id}, s3_key={s3_key}")
            
            # AI 분석 API 호출
            await self.start_ai_analysis(schedule_id, s3_key)
            
        except Exception as e:
            logger.error(f"면접 일정 처리 실패: scheduleId={schedule.get('scheduleId')}, error={e}")
    
    def extract_s3_key_from_notes(self, notes):
        """notes에서 S3 키 추출"""
        try:
            if not notes:
                return None
            
            # JSON에서 s3_key 추출
            import json
            import re
            
            # 여러 줄의 JSON이 있을 수 있으므로 각 줄을 확인
            lines = notes.strip().split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    try:
                        data = json.loads(line)
                        if 's3_key' in data:
                            return data['s3_key']
                    except json.JSONDecodeError:
                        continue
            
            # 정규식으로도 시도
            pattern = r'"s3_key":\s*"([^"]+)"'
            match = re.search(pattern, notes)
            if match:
                return match.group(1)
            
            return None
            
        except Exception as e:
            logger.error(f"S3 키 추출 실패: {e}")
            return None
    
    async def start_ai_analysis(self, schedule_id, s3_key):
        """AI 분석 시작"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{AI_ANALYSIS_API_URL}/analyze-interview",
                    params={
                        "schedule_id": schedule_id,
                        "s3_key": s3_key
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"AI 분석 시작 성공: scheduleId={schedule_id}, result={result}")
                else:
                    logger.error(f"AI 분석 시작 실패: scheduleId={schedule_id}, status={response.status_code}")
                    
        except Exception as e:
            logger.error(f"AI 분석 시작 실패: scheduleId={schedule_id}, error={e}")

async def main():
    """메인 함수"""
    analyzer = AutoAnalyzer()
    
    try:
        # Ctrl+C 시그널 처리
        await analyzer.start()
    except KeyboardInterrupt:
        logger.info("사용자에 의해 중단됨")
    finally:
        await analyzer.stop()

if __name__ == "__main__":
    asyncio.run(main()) 