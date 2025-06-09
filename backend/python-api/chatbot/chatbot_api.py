import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import PyPDF2
import openai

# .env에서 API 키 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_pdf_text(pdf_path):
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

PDF_TEXT = load_pdf_text("채용_관리자_가이드.pdf")  # 파일명 상황에 맞게

# 요청/응답 모델
class ChatRequest(BaseModel):
    history: list  # [{"role": "user"|"assistant", "content": "..."}]
    user_input: str
    lang: str = "ko"  # 추가: 언어 파라미터

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    lang = req.lang if req.lang in ["en", "ko"] else "ko"
    # 언어별 프롬프트
    if lang == "en":
        system_prompt = (
            "You are 'ZOOP', an AI chatbot for a global recruitment platform."
            " Below is the main content of the company introduction PDF."
            " Always answer based on the PDF content below, kindly and confidently."
            " Also, suggest 3-6 example follow-up questions in English between <EXAMPLES> and <END> tags."
            "\n\n----- PDF Guide -----\n"
            + PDF_TEXT[:8000]
            + "\n----------------------"
        )
    else:
        system_prompt = (
            "너는 'ZOOP'라는 AI 채용플랫폼 챗봇이야. "
            "아래는 회사 안내 PDF의 주요 내용이야. "
            "모든 답변은 PDF(아래 텍스트)에서 최대한 근거를 들어 요약해서 친절하고 신뢰감 있게 답변해. "
            "추가로 사용자가 질문할 만한 버튼 예시도 3~6개 정도 <EXAMPLES>~<END> 사이에 한글로 출력해줘."
            "\n\n----- PDF 안내 -----\n"
            + PDF_TEXT[:8000]
            + "\n----------------------"
        )

    # 대화 기록
    messages = [{"role": "system", "content": system_prompt}]
    messages += req.history
    messages.append({"role": "user", "content": req.user_input})

    response = client.chat.completions.create(
        model="gpt-4o",  # gpt-4o-mini/gpt-3.5-turbo 등 자유롭게
        messages=messages,
        max_tokens=600,
        temperature=0.18
    )
    answer = response.choices[0].message.content
    return {"answer": answer}
