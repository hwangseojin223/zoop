import os
import requests
import json
import asyncio
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
from typing import List, Optional, Dict, Any
import threading
import time

# .env에서 API 키 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SPRING_API_URL = os.getenv("SPRING_API_URL", "http://localhost:8081")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(
    title="Portfolio Matching API",
    description="AI 기반 포트폴리오 분석 및 채용공고 매칭 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델들
class PortfolioAnalysisRequest(BaseModel):
    portfolio_id: int
    candidate_id: int
    portfolio_content: str
    desired_job: Optional[str] = None
    self_introduction: Optional[str] = None

class PortfolioAnalysisResponse(BaseModel):
    success: bool
    analysis_id: Optional[int] = None
    analysis_data: Optional[str] = None
    error: Optional[str] = None

class JobMatchingRequest(BaseModel):
    portfolio_id: int
    analysis_id: int

class JobMatchingResponse(BaseModel):
    success: bool
    matches: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

def analyze_portfolio_content(portfolio_content: str, desired_job: Optional[str] = None, self_introduction: Optional[str] = None) -> dict:
    """OpenAI를 사용하여 포트폴리오 내용 분석"""
    
    # 분석할 텍스트 구성
    analysis_text = portfolio_content
    
    # desired_job이 있으면 추가, 없으면 self_introduction 사용
    if desired_job:
        analysis_text += f"\n\n희망 직무: {desired_job}"
    elif self_introduction:
        analysis_text += f"\n\n자기소개: {self_introduction}"
    
    prompt = f"""
다음은 지원자의 포트폴리오 내용입니다. 이를 종합적으로 분석해주세요.

{analysis_text}

다음 기준으로 분석해주세요:

1. **기술 스택**: 사용 가능한 프로그래밍 언어, 프레임워크, 도구들
2. **프로젝트 경험**: 주요 프로젝트와 그 역할, 성과
3. **문제해결 능력**: 기술적 문제 해결 사례와 접근 방법
4. **협업 능력**: 팀 프로젝트 경험과 협업 스타일
5. **학습 의지**: 새로운 기술 학습과 자기계발 의지
6. **전문 분야**: 가장 강점을 가진 기술 분야
7. **경력 수준**: 주니어/미드레벨/시니어 수준 판단

각 항목별로 구체적인 내용을 분석하고, 종합적인 평가를 제공해주세요.

반드시 아래 형식으로 출력해주세요:
기술 스택: [분석 내용]
프로젝트 경험: [분석 내용]
문제해결 능력: [분석 내용]
협업 능력: [분석 내용]
학습 의지: [분석 내용]
전문 분야: [분석 내용]
경력 수준: [분석 내용]
종합평가: [3-4줄 종합 평가]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 IT 채용 전문가입니다. 객관적이고 정확하게 포트폴리오를 분석해주세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        analysis_text = response.choices[0].message.content
        
        return {
            "analysis": analysis_text,
            "portfolio_content": portfolio_content,
            "desired_job": desired_job,
            "self_introduction": self_introduction
        }
        
    except Exception as e:
        print(f"OpenAI analysis error: {e}")
        return {
            "analysis": f"분석 중 오류가 발생했습니다: {e}",
            "portfolio_content": portfolio_content,
            "desired_job": desired_job,
            "self_introduction": self_introduction
        }

def match_portfolio_to_jobs(analysis_data: str) -> Dict[str, Any]:
    """포트폴리오 분석 결과를 바탕으로 적합한 채용공고 매칭"""
    
    prompt = f"""
다음은 지원자의 포트폴리오 분석 결과입니다:

{analysis_data}

이 분석 결과를 바탕으로, 이 지원자에게 가장 적합한 채용공고의 특징을 파악해주세요.

다음 기준으로 매칭 점수를 계산해주세요:

1. **기술 스택 일치도 (30점)**: 요구 기술과 보유 기술의 일치 정도
2. **경력 수준 적합성 (25점)**: 요구 경력과 현재 경력 수준의 적합성
3. **프로젝트 경험 관련성 (25점)**: 과거 프로젝트와 업무 내용의 관련성
4. **성장 가능성 (20점)**: 회사에서의 성장 가능성과 학습 의지

각 항목별 점수와 근거를 제시하고, 최종 매칭 점수를 계산해주세요.

반드시 아래 형식으로 출력해주세요:
기술 스택 일치도: [점수]점 - [근거]
경력 수준 적합성: [점수]점 - [근거]
프로젝트 경험 관련성: [점수]점 - [근거]
성장 가능성: [점수]점 - [근거]
총 매칭 점수: [총점]점
추천 직무: [추천하는 직무 분야]
매칭 근거: [3-4줄 매칭 근거]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 IT 채용 매칭 전문가입니다. 정확하고 객관적으로 매칭 분석을 해주세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        matching_analysis = response.choices[0].message.content
        
        # 점수 추출
        import re
        score_match = re.search(r"총 매칭 점수:\s*(\d+)점", matching_analysis)
        score = float(score_match.group(1)) if score_match else 0.0
        
        return {
            "matching_analysis": matching_analysis,
            "matching_score": score,
            "recommended_job": "AI 분석 기반 추천 직무"
        }
        
    except Exception as e:
        print(f"OpenAI matching error: {e}")
        return {
            "matching_analysis": f"매칭 분석 중 오류가 발생했습니다: {e}",
            "matching_score": 0.0,
            "recommended_job": "분석 불가"
        }

def save_portfolio_analysis_to_spring(portfolio_id: int, analysis_data: str, analysis_type: str = "standalone_portfolio") -> Optional[int]:
    """Spring 백엔드에 포트폴리오 분석 결과 저장"""
    try:
        # 먼저 job_candidate_id 없이 저장 (나중에 업데이트할 예정)
        payload = {
            "analysisType": analysis_type,
            "jobCandidateId": None,  # 나중에 업데이트할 예정
            "analysisData": analysis_data,
            "analysisScore": 0.0  # 포트폴리오 분석은 점수 없음
        }
        
        response = requests.post(
            f"{SPRING_API_URL}/api/ai-analysis-results",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 201:
            result = response.json()
            return result.get("analysisId")
        else:
            print(f"Spring API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Spring API save error: {e}")
        return None

def get_job_candidate_id_by_candidate_and_post(candidate_id: int, post_id: int) -> Optional[int]:
    """candidate_id와 post_id로 job_candidate_id 조회"""
    try:
        response = requests.get(
            f"{SPRING_API_URL}/api/progress/{post_id}/{candidate_id}/job-candidate-id",
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("jobCandidateId")
        else:
            print(f"Failed to get job_candidate_id: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error getting job_candidate_id: {e}")
        return None

def update_ai_analysis_job_candidate_id(analysis_id: int, job_candidate_id: int) -> bool:
    """ai_analysis_results의 job_candidate_id 업데이트"""
    try:
        payload = {
            "jobCandidateId": job_candidate_id
        }
        
        response = requests.put(
            f"{SPRING_API_URL}/api/ai-analysis-results/{analysis_id}/job-candidate-id",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"[INFO] AI analysis job_candidate_id updated successfully: analysis_id={analysis_id}, job_candidate_id={job_candidate_id}")
            return True
        else:
            print(f"[WARN] Failed to update AI analysis job_candidate_id: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] AI analysis job_candidate_id update error: {e}")
        return False

def get_job_candidate_id_by_portfolio(portfolio_id: int) -> Optional[int]:
    """portfolio_id로 job_candidate_id 조회"""
    try:
        response = requests.get(
            f"{SPRING_API_URL}/api/portfolio-job-matches/portfolio/{portfolio_id}/job-candidate-id",
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("jobCandidateId")
        else:
            print(f"Failed to get job_candidate_id: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error getting job_candidate_id: {e}")
        return None

def save_portfolio_job_matches_to_spring(portfolio_id: int, matches: List[Dict[str, Any]]) -> bool:
    """Spring 백엔드에 포트폴리오-채용공고 매칭 결과 저장"""
    try:
        for match in matches:
            payload = {
                "portfolioId": portfolio_id,
                "jobPostingId": match.get("jobPostingId", 0),
                "matchingScore": match.get("matching_score", 0.0),
                "matchingReason": match.get("matching_analysis", "")
            }
            
            response = requests.post(
                f"{SPRING_API_URL}/api/portfolio-job-matches",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 201:
                print(f"Failed to save match: {response.status_code} - {response.text}")
                return False
        
        return True
        
    except Exception as e:
        print(f"Spring API save matches error: {e}")
        return False

def update_job_cand_progress_to_2y(candidate_id: int, post_id: int) -> bool:
    """job_cand_progress에 새로운 행을 2y 상태로 생성"""
    try:
        # 새로운 job_cand_progress 행을 2y 상태로 생성
        payload = {
            "postId": post_id,
            "candidateId": candidate_id,
            "jobCandCurrStage": "2y"
        }
        
        response = requests.post(
            f"{SPRING_API_URL}/api/progress/create",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 201:
            print(f"[INFO] New JobCandProgress created with 2y stage: candidate_id={candidate_id}, post_id={post_id}")
            return True
        else:
            print(f"[WARN] Failed to create JobCandProgress: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] JobCandProgress creation error: {e}")
        return False

async def process_portfolio_analysis_async(portfolio_id: int, candidate_id: int, portfolio_content: str, 
                                         desired_job: Optional[str] = None, self_introduction: Optional[str] = None):
    """비동기로 포트폴리오 분석 처리"""
    try:
        print(f"[INFO] Starting async portfolio analysis for portfolio_id: {portfolio_id}")
        
        # 1. 포트폴리오 내용 분석
        analysis_result = analyze_portfolio_content(portfolio_content, desired_job, self_introduction)
        
        # 2. Spring 백엔드에 분석 결과 저장 (job_candidate_id 없이)
        analysis_id = save_portfolio_analysis_to_spring(portfolio_id, analysis_result["analysis"])
        
        if analysis_id:
            print(f"[INFO] Portfolio analysis saved with ID: {analysis_id}")
            
            # 3. Spring 백엔드에서 활성 채용공고 목록 조회
            active_jobs = get_active_jobs_from_spring()
            
            # 4. 각 채용공고와 매칭 분석
            matches = []
            for job in active_jobs:
                job_matching_result = match_portfolio_to_specific_job(analysis_result["analysis"], job)
                if job_matching_result["matching_score"] >= 50:  # 50점 이상만 저장
                    job_matching_result["jobPostingId"] = job.get("postId")
                    matches.append(job_matching_result)
            
            # 5. 매칭 결과를 Spring 백엔드에 저장
            if matches:
                save_success = save_portfolio_job_matches_to_spring(portfolio_id, matches)
                if save_success:
                    print(f"[INFO] Portfolio-job matches saved successfully: {len(matches)} matches")
                else:
                    print(f"[WARN] Failed to save portfolio-job matches")
            else:
                print(f"[INFO] No matches found with score >= 50")
        else:
            print(f"[ERROR] Failed to save portfolio analysis")
            
    except Exception as e:
        print(f"[ERROR] Async portfolio analysis error: {e}")

def get_active_jobs_from_spring() -> List[Dict[str, Any]]:
    """Spring 백엔드에서 활성 채용공고 목록 조회"""
    try:
        response = requests.get(
            f"{SPRING_API_URL}/api/posts/active",
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to get active jobs: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error getting active jobs: {e}")
        return []

def match_portfolio_to_specific_job(analysis_data: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """특정 채용공고와 포트폴리오 매칭 분석"""
    
    job_title = job_data.get("postTitle", "")
    job_description = job_data.get("postDescription", "")
    job_language = job_data.get("postProgrammingLanguage", "")
    job_ideal_candidate = job_data.get("postIdealCandidate", "")
    job_location = job_data.get("postLocation", "")
    job_salary_min = job_data.get("postSalaryStart", 0)
    job_salary_max = job_data.get("postSalaryEnd", 0)
    
    prompt = f"""
다음은 지원자의 포트폴리오 분석 결과와 채용공고 정보입니다.

[포트폴리오 분석 결과]
{analysis_data}

[채용공고 정보]
제목: {job_title}
설명: {job_description}
요구 기술: {job_language}
인재상: {job_ideal_candidate}
근무 지역: {job_location}
연봉 범위: {job_salary_min}~{job_salary_max}

이 분석 결과를 바탕으로, 이 지원자와 채용공고의 매칭 점수를 계산해주세요.

다음 기준으로 매칭 점수를 계산해주세요:

1. **기술 스택 일치도 (30점)**: 요구 기술과 보유 기술의 일치 정도
2. **경력 수준 적합성 (25점)**: 요구 경력과 현재 경력 수준의 적합성
3. **프로젝트 경험 관련성 (25점)**: 과거 프로젝트와 업무 내용의 관련성
4. **성장 가능성 (20점)**: 회사에서의 성장 가능성과 학습 의지

각 항목별 점수와 근거를 제시하고, 최종 매칭 점수를 계산해주세요.

반드시 아래 형식으로 출력해주세요:
기술 스택 일치도: [점수]점 - [근거]
경력 수준 적합성: [점수]점 - [근거]
프로젝트 경험 관련성: [점수]점 - [근거]
성장 가능성: [점수]점 - [근거]
총 매칭 점수: [총점]점
추천 직무: [추천하는 직무 분야]
매칭 근거: [3-4줄 매칭 근거]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 IT 채용 매칭 전문가입니다. 정확하고 객관적으로 매칭 분석을 해주세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        matching_analysis = response.choices[0].message.content
        
        # 점수 추출
        import re
        score_match = re.search(r"총 매칭 점수:\s*(\d+)점", matching_analysis)
        score = float(score_match.group(1)) if score_match else 0.0
        
        return {
            "matching_analysis": matching_analysis,
            "matching_score": score,
            "recommended_job": job_title
        }
        
    except Exception as e:
        print(f"OpenAI matching error: {e}")
        return {
            "matching_analysis": f"매칭 분석 중 오류가 발생했습니다: {e}",
            "matching_score": 0.0,
            "recommended_job": job_title
        }

@app.post("/analyze-portfolio", response_model=PortfolioAnalysisResponse)
async def analyze_portfolio(
    portfolio_id: int = Form(...),
    candidate_id: int = Form(...),
    portfolio_content: str = Form(...),
    desired_job: str = Form(""),
    self_introduction: str = Form("")
):
    """포트폴리오 분석 API"""
    try:
        print(f"Starting portfolio analysis for portfolio_id: {portfolio_id}, candidate_id: {candidate_id}")
        
        # 즉시 응답 (비동기 처리)
        response = PortfolioAnalysisResponse(
            success=True,
            analysis_id=None,
            analysis_data="포트폴리오 분석이 시작되었습니다. 잠시 후 결과를 확인해주세요.",
            error=None
        )
        
        # 비동기로 분석 처리 시작
        asyncio.create_task(
            process_portfolio_analysis_async(
                portfolio_id, candidate_id, portfolio_content, 
                desired_job, self_introduction
            )
        )
        
        return response
        
    except Exception as e:
        print(f"Portfolio analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"포트폴리오 분석 중 오류가 발생했습니다: {e}")

@app.post("/analyze-candidate-portfolio")
async def analyze_candidate_portfolio(
    file_url: str = Form(...),
    cand_portfolio_id: int = Form(...),
    candidate_id: int = Form(...)
):
    """candidate_portfolios 분석 API"""
    try:
        print(f"Starting candidate portfolio analysis for cand_portfolio_id: {cand_portfolio_id}, candidate_id: {candidate_id}")
        
        # 파일 내용 추출 (간단한 텍스트 분석)
        portfolio_content = f"포트폴리오 파일: {file_url}"
        
        # 포트폴리오 내용 분석
        analysis_result = analyze_portfolio_content(portfolio_content)
        
        # 분석 결과를 Spring 백엔드에 저장 (type: "standalone_portfolio")
        analysis_id = save_portfolio_analysis_to_spring(
            cand_portfolio_id, 
            analysis_result["analysis"], 
            "standalone_portfolio"
        )
        
        if analysis_id:
            print(f"[INFO] Candidate portfolio analysis saved with ID: {analysis_id}")
            
            # Spring 백엔드에서 활성 채용공고 목록 조회
            active_jobs = get_active_jobs_from_spring()
            
            # 각 채용공고와 매칭 분석
            matches = []
            for job in active_jobs:
                job_matching_result = match_portfolio_to_specific_job(analysis_result["analysis"], job)
                if job_matching_result["matching_score"] >= 50:  # 50점 이상만 저장
                    job_matching_result["jobPostingId"] = job.get("postId")
                    matches.append(job_matching_result)
            
            # 매칭 결과를 Spring 백엔드에 저장
            if matches:
                save_success = save_portfolio_job_matches_to_spring(cand_portfolio_id, matches)
                if save_success:
                    print(f"[INFO] Candidate portfolio-job matches saved successfully: {len(matches)} matches")
                    
                    # 매칭된 각 공고에 대해 job_cand_progress를 2y로 업데이트
                    for match in matches:
                        post_id = match.get("jobPostingId")
                        if post_id:
                            update_success = update_job_cand_progress_to_2y(candidate_id, post_id)
                            if update_success:
                                print(f"[INFO] JobCandProgress updated to 2y for candidate_id={candidate_id}, post_id={post_id}")
                                
                                # job_cand_progress가 생성된 후 ai_analysis_results의 job_candidate_id 업데이트
                                job_candidate_id = get_job_candidate_id_by_candidate_and_post(candidate_id, post_id)
                                if job_candidate_id and analysis_id:
                                    update_ai_analysis_job_candidate_id(analysis_id, job_candidate_id)
                                    print(f"[INFO] AI analysis job_candidate_id updated: analysis_id={analysis_id}, job_candidate_id={job_candidate_id}")
                            else:
                                print(f"[WARN] Failed to update JobCandProgress for candidate_id={candidate_id}, post_id={post_id}")
                else:
                    print(f"[WARN] Failed to save candidate portfolio-job matches")
            else:
                print(f"[INFO] No matches found with score >= 50")
        else:
            print(f"[ERROR] Failed to save candidate portfolio analysis")
        
        return {
            "success": True,
            "analysis_data": analysis_result["analysis"],
            "analysis_id": analysis_id,
            "matches_count": len(matches) if 'matches' in locals() else 0
        }
        
    except Exception as e:
        print(f"Candidate portfolio analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"candidate_portfolio 분석 중 오류가 발생했습니다: {e}")

@app.post("/match-portfolio-jobs", response_model=JobMatchingResponse)
async def match_portfolio_jobs(
    portfolio_id: int = Form(...),
    analysis_id: int = Form(...)
):
    """포트폴리오-채용공고 매칭 API"""
    try:
        print(f"Starting portfolio-job matching for portfolio_id: {portfolio_id}, analysis_id: {analysis_id}")
        
        # Spring API에서 분석 결과 조회
        analysis_response = requests.get(
            f"{SPRING_API_URL}/api/ai-analysis-results/{analysis_id}",
            timeout=30
        )
        
        if analysis_response.status_code != 200:
            raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다.")
        
        analysis_data = analysis_response.json().get("analysisData", "")
        
        # 매칭 분석 수행
        matching_result = match_portfolio_to_jobs(analysis_data)
        
        # 매칭 결과를 Spring 백엔드에 저장
        matches = [matching_result]
        save_success = save_portfolio_job_matches_to_spring(portfolio_id, matches)
        
        if not save_success:
            print(f"[WARN] Failed to save matching results")
        
        return JobMatchingResponse(
            success=True,
            matches=matches,
            error=None
        )
        
    except Exception as e:
        print(f"Portfolio-job matching error: {e}")
        raise HTTPException(status_code=500, detail=f"매칭 분석 중 오류가 발생했습니다: {e}")

@app.get("/health")
async def health_check():
    """헬스 체크 API"""
    return {"status": "healthy", "service": "portfolio-matching-api"}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Portfolio Matching API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 