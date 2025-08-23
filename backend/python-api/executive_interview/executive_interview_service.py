import os
import json
import logging
from typing import Dict, Any, Optional
import openai
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExecutiveInterviewService:
    """
    임원면접 AI 분석 서비스
    - 화자 분리 (Speaker Diarization)
    - 음성-텍스트 변환 (Speech-to-Text)
    - 면접 내용 AI 분석 및 평가
    """
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def analyze_interview_conversation(self, 
                                     transcript: str, 
                                     job_description: str,
                                     candidate_profile: str) -> Dict[str, Any]:
        """
        임원면접 대화 내용을 AI로 분석하여 평가 결과를 반환
        
        Args:
            transcript: 화자 분리된 대화 내용
            job_description: 채용 공고 내용
            candidate_profile: 지원자 프로필 정보
            
        Returns:
            분석 결과 딕셔너리
        """
        try:
            logger.info("임원면접 AI 분석 시작")
            
            # AI 분석 프롬프트 구성
            analysis_prompt = self._build_analysis_prompt(
                transcript, job_description, candidate_profile
            )
            
            # OpenAI GPT-4로 분석 수행
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 IT 채용 전문가입니다. 임원면접 내용을 분석하여 지원자의 적합성을 평가해주세요."
                    },
                    {
                        "role": "user", 
                        "content": analysis_prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # 응답 파싱
            analysis_result = response.choices[0].message.content
            
            # 구조화된 결과 생성
            structured_result = self._structure_analysis_result(analysis_result)
            
            logger.info("임원면접 AI 분석 완료")
            return structured_result
            
        except Exception as e:
            logger.error(f"임원면접 AI 분석 실패: {str(e)}")
            raise
    
    def _build_analysis_prompt(self, 
                              transcript: str, 
                              job_description: str, 
                              candidate_profile: str) -> str:
        """
        AI 분석을 위한 프롬프트 구성
        """
        prompt = f"""
        다음은 IT 채용 임원면접의 대화 내용입니다. 지원자의 적합성을 종합적으로 평가해주세요.

        [채용 공고 정보]
        {job_description}

        [지원자 프로필]
        {candidate_profile}

        [면접 대화 내용]
        {transcript}

        다음 항목들을 평가하여 JSON 형태로 응답해주세요:

        1. **전문성 (Professionalism)**: 1-10점
           - 기술적 지식과 경험
           - 업계 트렌드 이해도
           - 문제 해결 능력

        2. **의사소통 능력 (Communication)**: 1-10점
           - 명확한 의사 전달
           - 적극적인 소통 태도
           - 질문에 대한 적절한 응답

        3. **팀워크 및 협업 (Teamwork)**: 1-10점
           - 협업 경험과 사례
           - 갈등 해결 능력
           - 팀 기여도

        4. **성장 의지 (Growth Mindset)**: 1-10점
           - 학습 의지
           - 자기 개발 계획
           - 도전 정신

        5. **문화적 적합성 (Cultural Fit)**: 1-10점
           - 회사 가치관과의 일치도
           - 업무 스타일 적합성
           - 장기적 비전

        6. **종합 평가 점수**: 1-10점
           - 위 항목들의 가중 평균

        7. **강점 (Strengths)**: 3-5개
        8. **개선점 (Areas for Improvement)**: 2-3개
        9. **최종 추천 (Recommendation)**: "합격", "보류", "불합격"
        10. **상세 평가 (Detailed Assessment)**: 종합적인 평가 의견

        JSON 형태로 응답해주세요.
        """
        return prompt
    
    def _structure_analysis_result(self, analysis_text: str) -> Dict[str, Any]:
        """
        AI 분석 결과를 구조화된 형태로 변환
        """
        try:
            # JSON 추출 시도
            if "```json" in analysis_text:
                json_start = analysis_text.find("```json") + 7
                json_end = analysis_text.find("```", json_start)
                json_str = analysis_text[json_start:json_end].strip()
                return json.loads(json_str)
            elif "{" in analysis_text and "}" in analysis_text:
                # JSON 블록이 없는 경우 중괄호로 감싸진 부분 추출
                start = analysis_text.find("{")
                end = analysis_text.rfind("}") + 1
                json_str = analysis_text[start:end]
                return json.loads(json_str)
            else:
                # JSON이 아닌 경우 기본 구조 반환
                return {
                    "error": "AI 분석 결과를 JSON으로 파싱할 수 없습니다.",
                    "raw_result": analysis_text,
                    "recommendation": "보류",
                    "analysis_score": 5.0
                }
                
        except json.JSONDecodeError as e:
            logger.warning(f"JSON 파싱 실패, 기본 구조 반환: {str(e)}")
            return {
                "error": f"JSON 파싱 오류: {str(e)}",
                "raw_result": analysis_text,
                "recommendation": "보류",
                "analysis_score": 5.0
            }
    
    def get_analysis_summary(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        분석 결과의 요약 정보 반환
        """
        try:
            return {
                "analysis_score": analysis_result.get("종합 평가 점수", 5.0),
                "recommendation": analysis_result.get("최종 추천", "보류"),
                "strengths": analysis_result.get("강점", []),
                "improvements": analysis_result.get("개선점", []),
                "detailed_assessment": analysis_result.get("상세 평가", ""),
                "full_analysis": analysis_result
            }
        except Exception as e:
            logger.error(f"분석 결과 요약 생성 실패: {str(e)}")
            return {
                "analysis_score": 5.0,
                "recommendation": "보류",
                "error": str(e)
            } 