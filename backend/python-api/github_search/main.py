from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import FilterRequest
from github_search_logic import enhanced_search_github_candidates as search_github_candidates

app = FastAPI()

# CORS 미들웨어 등록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발환경에선 * 허용, 운영시 도메인 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/search")
def search(filters: FilterRequest):
    print("[DEBUG] FastAPI에서 받은 filters:", filters)
    print("[DEBUG] FastAPI에서 받은 headcount:", getattr(filters, 'headcount', None))
    print("[DEBUG] FastAPI에서 받은 post_id:", getattr(filters, 'post_id', None))
    results = search_github_candidates(filters, getattr(filters, 'post_id', None))
    return {"candidates": results}
