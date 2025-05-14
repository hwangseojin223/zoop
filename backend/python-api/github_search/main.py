# main.py
from fastapi import FastAPI
from models import FilterRequest
from github_search_logic import search_github_candidates

app = FastAPI()

@app.post("/search")
def search(filters: FilterRequest):
    results = search_github_candidates(filters)
    return {"candidates": results}
