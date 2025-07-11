import os
import requests
import json
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
from typing import List

# .env에서 API 키 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterviewQuestionsRequest(BaseModel):
    post_title: str
    post_description: str
    programming_language: str
    ideal_candidate: str
    location: str
    salary_range: str = ""
    headcount: int = 1
    portfolio_analysis: str = ""

class InterviewQuestionsResponse(BaseModel):
    success: bool
    questions: List[str] = []
    error: str = None

def call_openai_chat(messages, max_tokens=800, temperature=0.3):
    """OpenAI API 호출 함수"""
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return (
            response.choices[0].message.content
            if response.choices and hasattr(response.choices[0], "message")
            else "AI가 응답하지 않았습니다."
        )
    except Exception as e:
        print(f"[OpenAI API Error] {e}")
        return "AI 서버 연결에 문제가 발생했습니다."

def generate_interview_questions(post_title: str, post_description: str, 
                               programming_language: str, ideal_candidate: str, 
                               location: str, salary_range: str, headcount: int, 
                               portfolio_analysis: str = "") -> List[str]:
    """OpenAI를 사용하여 면접 질문 생성"""
    
    # 포트폴리오 분석 결과가 있는 경우 프롬프트에 포함
    portfolio_section = ""
    if portfolio_analysis and portfolio_analysis.strip():
        portfolio_section = f"""
=== 지원자 포트폴리오 분석 결과 ===
{portfolio_analysis}

이 분석 결과를 참고하여 지원자의 강점과 약점을 파악하고, 그에 맞는 맞춤형 질문을 생성해주세요.
"""

    prompt = f"""
당신은 전문적인 AI 면접관입니다. 아래 채용 공고 정보와 지원자의 포트폴리오 분석 결과를 종합하여 해당 직무에 적합한 면접 질문 3개를 생성해주세요.

=== 채용 공고 정보 ===
공고 제목: {post_title}
직무 설명: {post_description}
요구 기술: {programming_language}
인재상: {ideal_candidate}
근무 지역: {location}
연봉 범위: {salary_range}
모집 인원: {headcount}명{portfolio_section}

=== 질문 생성 지침 ===
1. **기술적 역량 질문**: 요구 기술과 관련된 구체적인 경험이나 지식을 파악할 수 있는 질문
2. **직무 적합성 질문**: 직무 설명과 인재상에 맞는 역량이나 경험을 확인할 수 있는 질문  
3. **개인적 역량 질문**: 소프트 스킬, 문제해결 능력, 팀워크, 리더십 등을 평가할 수 있는 질문

=== 질문 생성 기준 ===
- 각 질문은 구체적이고 답변하기 쉬우면서도 지원자의 역량을 정확히 파악할 수 있어야 함
- 공고의 요구사항과 인재상에 맞는 맞춤형 질문이어야 함
- 포트폴리오 분석 결과가 있다면, 그 내용을 참고하여 지원자의 강점을 살리거나 약점을 보완할 수 있는 질문을 포함해야 함
- 기술적 질문과 인성/역량 질문의 균형을 맞춰야 함
- 질문은 자연스럽고 대화하기 편한 톤으로 작성해야 함

=== 출력 형식 ===
질문 3개만 번호 없이 줄바꿈으로 구분해서 출력해주세요.
예시:
자기소개를 해주세요.
{programming_language} 기술에 대한 경험과 이해도를 설명해주세요.
팀 프로젝트에서의 협업 경험과 갈등 해결 사례를 설명해주세요.
"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "당신은 전문적인 AI 면접관입니다. 채용 공고 정보를 분석하여 적합한 면접 질문을 생성해주세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.3
        )
        
        questions_text = response.choices[0].message.content.strip()
        
        # 질문을 줄바꿈으로 분리하고 빈 줄 제거
        questions = [q.strip() for q in questions_text.split('\n') if q.strip()]
        
        # 질문이 3개가 아니면 기본 질문으로 보완
        if len(questions) < 3:
            default_questions = [
                "자기소개를 해주세요.",
                "이 직무에 지원한 이유는 무엇인가요?",
                "가장 기억에 남는 프로젝트에 대해 설명해주세요."
            ]
            questions.extend(default_questions[len(questions):])
        
        # 최대 3개까지만 반환
        return questions[:3]
        
    except Exception as e:
        print(f"OpenAI 질문 생성 오류: {e}")
        # 오류 발생 시 기본 질문 반환
        return [
            "자기소개를 해주세요.",
            "이 직무에 지원한 이유는 무엇인가요?",
            "가장 기억에 남는 프로젝트에 대해 설명해주세요."
        ]

@app.post("/generate-questions", response_model=InterviewQuestionsResponse)
async def generate_questions_endpoint(
    post_title: str = Form(...),
    post_description: str = Form(...),
    programming_language: str = Form(...),
    ideal_candidate: str = Form(...),
    location: str = Form(...),
    salary_range: str = Form(""),
    headcount: int = Form(1),
    portfolio_analysis: str = Form("")
):
    """면접 질문 생성 API"""
    try:
        print(f"면접 질문 생성 요청:")
        print(f"- 공고 제목: {post_title}")
        print(f"- 요구 기술: {programming_language}")
        print(f"- 인재상: {ideal_candidate}")
        print(f"- 포트폴리오 분석 결과: {'있음' if portfolio_analysis else '없음'}")
        
        questions = generate_interview_questions(
            post_title, post_description, programming_language,
            ideal_candidate, location, salary_range, headcount, portfolio_analysis
        )
        
        print(f"생성된 질문: {questions}")
        
        return InterviewQuestionsResponse(
            success=True,
            questions=questions
        )
        
    except Exception as e:
        print(f"면접 질문 생성 오류: {e}")
        return InterviewQuestionsResponse(
            success=False,
            error=f"질문 생성 중 오류가 발생했습니다: {e}"
        )

@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "service": "interview-questions",
        "model": OPENAI_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003) 