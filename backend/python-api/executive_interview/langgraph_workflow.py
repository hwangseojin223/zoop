import os
import json
import logging
from typing import Dict, Any, List, Annotated
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# 음성 처리 서비스 import
from audio_processing_service import AudioProcessingService

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI 모델 초기화
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.3,
    api_key=os.getenv("OPENAI_API_KEY")
)

class ExecutiveInterviewWorkflow:
    """
    임원면접 AI 분석을 위한 LangGraph 워크플로우
    
    워크플로우 단계:
    1. 면접 녹화 파일 처리 (화자 분리 + 음성-텍스트 변환)
    2. 대화 내용 전처리 및 정리
    3. AI 분석 수행 (지원자 평가)
    4. 결과 요약 및 최종 추천
    """
    
    def __init__(self):
        # 음성 처리 서비스 초기화
        self.audio_service = AudioProcessingService()
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """
        LangGraph 워크플로우 구성
        """
        # 상태 그래프 생성
        workflow = StateGraph(StateType=Dict[str, Any])
        
        # 노드 추가
        workflow.add_node("process_interview_recording", self._process_interview_recording)
        workflow.add_node("preprocess_conversation", self._preprocess_conversation)
        workflow.add_node("analyze_with_ai", self._analyze_with_ai)
        workflow.add_node("generate_final_recommendation", self._generate_final_recommendation)
        
        # 엣지 연결
        workflow.set_entry_point("process_interview_recording")
        workflow.add_edge("process_interview_recording", "preprocess_conversation")
        workflow.add_edge("preprocess_conversation", "analyze_with_ai")
        workflow.add_edge("analyze_with_ai", "generate_final_recommendation")
        workflow.add_edge("generate_final_recommendation", END)
        
        return workflow.compile()
    
    def _process_interview_recording(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        면접 녹화 파일 처리
        - S3에서 음성 파일 다운로드
        - 화자 분리 (Speaker Diarization)
        - 음성-텍스트 변환 (Speech-to-Text)
        """
        try:
            logger.info("면접 녹화 파일 처리 시작")
            
            # S3 키 또는 파일 경로 확인
            s3_key = state.get("s3_key")
            interview_file_path = state.get("interview_file_path")
            
            if s3_key:
                # S3에서 음성 파일 처리
                logger.info(f"S3에서 음성 파일 처리: {s3_key}")
                audio_result = self.audio_service.process_interview_audio(s3_key)
                
                if audio_result.get("processing_status") == "completed":
                    state["transcript"] = audio_result["transcript"]
                    state["speaker_count"] = audio_result["speaker_count"]
                    state["recording_duration"] = f"{audio_result['total_duration']:.1f}초"
                    state["speaker_segments"] = audio_result["speaker_segments"]
                    state["audio_processing_success"] = True
                else:
                    state["error"] = audio_result.get("error", "음성 파일 처리 실패")
                    state["audio_processing_success"] = False
                    
            elif interview_file_path:
                # 로컬 파일 처리 (업로드된 파일)
                logger.info(f"로컬 음성 파일 처리: {interview_file_path}")
                
                # WAV 형식으로 변환
                wav_path = self.audio_service.convert_to_wav(interview_file_path)
                
                # 화자별 대화 내용 생성
                transcript = self.audio_service.create_speaker_transcript(wav_path)
                speaker_segments = self.audio_service.separate_speakers(wav_path)
                
                state["transcript"] = transcript
                state["speaker_count"] = len(set(seg["speaker"] for seg in speaker_segments))
                state["recording_duration"] = f"{speaker_segments[-1]['end'] if speaker_segments else 0:.1f}초"
                state["speaker_segments"] = speaker_segments
                state["audio_processing_success"] = True
                
            else:
                # 음성 파일이 없는 경우 시뮬레이션된 결과 반환 (테스트용)
                logger.warning("음성 파일 정보가 없습니다. 시뮬레이션된 결과를 반환합니다.")
                mock_transcript = """
                [면접관] 안녕하세요. 오늘 면접에 응해주셔서 감사합니다.
                [지원자] 안녕하세요. 저는 김개발입니다. 잘 부탁드립니다.
                [면접관] 자기소개를 간단히 해주세요.
                [지원자] 네, 저는 5년간 웹 개발을 해왔고, React와 Node.js에 전문성을 가지고 있습니다.
                [면접관] 팀 프로젝트에서 갈등이 있었던 경험이 있나요?
                [지원자] 네, 기술 스택 선택에 대한 의견 차이가 있었는데, 팀원들과 논의하여 최적의 해결책을 찾았습니다.
                """
                
                state["transcript"] = mock_transcript
                state["speaker_count"] = 2
                state["recording_duration"] = "15분"
                state["audio_processing_success"] = False
                state["simulation_mode"] = True
            
            logger.info("면접 녹화 파일 처리 완료")
            return state
            
        except Exception as e:
            logger.error(f"면접 녹화 파일 처리 실패: {str(e)}")
            state["error"] = f"녹화 파일 처리 오류: {str(e)}"
            state["audio_processing_success"] = False
            return state
    
    def _preprocess_conversation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        대화 내용 전처리 및 정리
        """
        try:
            logger.info("대화 내용 전처리 시작")
            
            transcript = state.get("transcript", "")
            
            # 대화 내용 정리
            cleaned_transcript = self._clean_transcript(transcript)
            
            # 주요 키워드 추출
            keywords = self._extract_keywords(cleaned_transcript)
            
            # 대화 구조 분석
            conversation_structure = self._analyze_conversation_structure(cleaned_transcript)
            
            state["cleaned_transcript"] = cleaned_transcript
            state["keywords"] = keywords
            state["conversation_structure"] = conversation_structure
            
            logger.info("대화 내용 전처리 완료")
            return state
            
        except Exception as e:
            logger.error(f"대화 내용 전처리 실패: {str(e)}")
            state["error"] = f"전처리 오류: {str(e)}"
            return state
    
    def _analyze_with_ai(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        AI를 사용한 면접 내용 분석
        """
        try:
            logger.info("AI 분석 시작")
            
            transcript = state.get("cleaned_transcript", "")
            job_description = state.get("job_description", "IT 개발자 채용")
            candidate_profile = state.get("candidate_profile", "웹 개발자")
            
            # AI 분석 프롬프트 구성
            analysis_prompt = self._build_ai_analysis_prompt(
                transcript, job_description, candidate_profile
            )
            
            # OpenAI로 분석 수행
            response = llm.invoke([
                SystemMessage(content="당신은 IT 채용 전문가입니다. 임원면접 내용을 분석하여 지원자의 적합성을 평가해주세요."),
                HumanMessage(content=analysis_prompt)
            ])
            
            # 분석 결과 파싱
            analysis_result = self._parse_ai_response(response.content)
            
            state["ai_analysis"] = analysis_result
            state["analysis_score"] = analysis_result.get("종합 평가 점수", 5.0)
            state["recommendation"] = analysis_result.get("최종 추천", "보류")
            
            logger.info("AI 분석 완료")
            return state
            
        except Exception as e:
            logger.error(f"AI 분석 실패: {str(e)}")
            state["error"] = f"AI 분석 오류: {str(e)}"
            return state
    
    def _generate_final_recommendation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        최종 추천 및 결과 요약 생성
        """
        try:
            logger.info("최종 추천 생성 시작")
            
            ai_analysis = state.get("ai_analysis", {})
            
            # 최종 추천 생성
            final_recommendation = {
                "overall_score": ai_analysis.get("종합 평가 점수", 5.0),
                "recommendation": ai_analysis.get("최종 추천", "보류"),
                "strengths": ai_analysis.get("강점", []),
                "improvements": ai_analysis.get("개선점", []),
                "detailed_assessment": ai_analysis.get("상세 평가", ""),
                "confidence_level": self._calculate_confidence_level(ai_analysis),
                "next_steps": self._suggest_next_steps(ai_analysis)
            }
            
            state["final_recommendation"] = final_recommendation
            state["workflow_completed"] = True
            
            logger.info("최종 추천 생성 완료")
            return state
            
        except Exception as e:
            logger.error(f"최종 추천 생성 실패: {str(e)}")
            state["error"] = f"최종 추천 생성 오류: {str(e)}"
            return state
    
    def _clean_transcript(self, transcript: str) -> str:
        """
        대화 내용 정리
        """
        # 불필요한 문자 제거 및 정리
        cleaned = transcript.replace("[", "").replace("]", "")
        cleaned = cleaned.replace("면접관", "Interviewer")
        cleaned = cleaned.replace("지원자", "Candidate")
        return cleaned.strip()
    
    def _extract_keywords(self, transcript: str) -> List[str]:
        """
        주요 키워드 추출
        """
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
        keywords = ["개발", "프로젝트", "팀워크", "기술", "경험", "문제해결"]
        return keywords
    
    def _analyze_conversation_structure(self, transcript: str) -> Dict[str, Any]:
        """
        대화 구조 분석
        """
        lines = transcript.split('\n')
        return {
            "total_lines": len(lines),
            "interviewer_lines": len([l for l in lines if "Interviewer" in l]),
            "candidate_lines": len([l for l in lines if "Candidate" in l]),
            "conversation_flow": "structured"
        }
    
    def _build_ai_analysis_prompt(self, transcript: str, job_description: str, candidate_profile: str) -> str:
        """
        AI 분석을 위한 프롬프트 구성
        """
        return f"""
        다음은 IT 채용 임원면접의 대화 내용입니다. 지원자의 적합성을 종합적으로 평가해주세요.

        [채용 공고 정보]
        {job_description}

        [지원자 프로필]
        {candidate_profile}

        [면접 대화 내용]
        {transcript}

        다음 항목들을 평가하여 JSON 형태로 응답해주세요:

        1. **전문성 (Professionalism)**: 1-10점
        2. **의사소통 능력 (Communication)**: 1-10점
        3. **팀워크 및 협업 (Teamwork)**: 1-10점
        4. **성장 의지 (Growth Mindset)**: 1-10점
        5. **문화적 적합성 (Cultural Fit)**: 1-10점
        6. **종합 평가 점수**: 1-10점
        7. **강점 (Strengths)**: 3-5개
        8. **개선점 (Areas for Improvement)**: 2-3개
        9. **최종 추천 (Recommendation)**: "합격", "보류", "불합격"
        10. **상세 평가 (Detailed Assessment)**: 종합적인 평가 의견

        JSON 형태로 응답해주세요.
        """
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """
        AI 응답을 파싱하여 구조화된 결과 반환
        """
        try:
            # JSON 추출 시도
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                return json.loads(json_str)
            elif "{" in response and "}" in response:
                start = response.find("{")
                end = response.rfind("}") + 1
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                return {
                    "error": "AI 응답을 JSON으로 파싱할 수 없습니다.",
                    "raw_response": response,
                    "종합 평가 점수": 5.0,
                    "최종 추천": "보류"
                }
        except json.JSONDecodeError:
            return {
                "error": "JSON 파싱 실패",
                "raw_response": response,
                "종합 평가 점수": 5.0,
                "최종 추천": "보류"
            }
    
    def _calculate_confidence_level(self, analysis: Dict[str, Any]) -> str:
        """
        분석 결과의 신뢰도 계산
        """
        score = analysis.get("종합 평가 점수", 5.0)
        if score >= 8.0:
            return "높음"
        elif score >= 6.0:
            return "보통"
        else:
            return "낮음"
    
    def _suggest_next_steps(self, analysis: Dict[str, Any]) -> List[str]:
        """
        다음 단계 제안
        """
        recommendation = analysis.get("최종 추천", "보류")
        
        if recommendation == "합격":
            return ["최종 채용 결정", "연봉 협상", "입사 일정 조율"]
        elif recommendation == "보류":
            return ["추가 면접", "레퍼런스 체크", "기술 테스트"]
        else:
            return ["거절 통보", "피드백 제공", "향후 기회 안내"]
    
    def run_workflow(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        워크플로우 실행
        """
        try:
            logger.info("임원면접 AI 분석 워크플로우 시작")
            result = self.workflow.invoke(initial_state)
            logger.info("임원면접 AI 분석 워크플로우 완료")
            return result
        except Exception as e:
            logger.error(f"워크플로우 실행 실패: {str(e)}")
            return {"error": f"워크플로우 실행 오류: {str(e)}"}

# 워크플로우 인스턴스 생성
executive_interview_workflow = ExecutiveInterviewWorkflow() 