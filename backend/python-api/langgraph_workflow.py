import requests
from langgraph.graph import StateGraph

# 1. 인재상 생성 agent (챗봇)
def chatbot_agent(input_data):
    print("[chatbot_agent] input:", input_data)
    # 실제로는 FastAPI 엔드포인트 호출 (예: requests.post)
    # response = requests.post('http://localhost:8001/ideal-candidate-chat', json=input_data)
    # return response.json()
    # 테스트용 더미 인재상 생성
    ideal_candidate = "AI 프로젝트 경험, 팀워크, 문제해결력"
    print("[chatbot_agent] output:", ideal_candidate)
    input_data["idealCandidate"] = ideal_candidate
    return input_data

# 2. 깃허브 후보자 탐색 agent (포폴 분석 포함)
def github_search_agent(input_data):
    print("[github_search_agent] input:", input_data)
    response = requests.post('http://localhost:8000/search', json=input_data)
    response.raise_for_status()
    print("[github_search_agent] output:", response.json())
    return response.json()  # {"candidates": [...]}

# 3. 면접 질문 생성 agent
def interview_questions_agent(candidates):
    print("[interview_questions_agent] input:", candidates)
    # 실제로는 FastAPI 엔드포인트 호출 (예: requests.post)
    # response = requests.post('http://localhost:8004/generate-questions', data=payload)
    # return response.json()
    # 테스트용 더미 질문 생성
    questions = ["AI 프로젝트에서 겪은 가장 큰 도전은 무엇이었나요?", "팀워크를 발휘한 경험을 말씀해 주세요."]
    print("[interview_questions_agent] output:", questions)
    return {"questions": questions, "candidates": candidates["candidates"]}

# 4. 면접 분석 agent
def interview_analysis_agent(data):
    print("[interview_analysis_agent] input:", data)
    results = []
    for idx, cand in enumerate(data["candidates"]):
        payload = {
            "schedule_id": idx + 1,  # 더미
            "job_candidate_id": idx + 1,  # 더미
            "post_title": "AI 엔지니어",
            "post_description": "AI 서비스 개발 및 운영",
            "ideal_candidate": "AI 프로젝트 경험, 팀워크, 문제해결력"
        }
        response = requests.post('http://localhost:8002/analyze-interview', data=payload)
        response.raise_for_status()
        print(f"[interview_analysis_agent] {cand.get('login', idx+1)} output:", response.json())
        results.append(response.json())
    return {"interview_results": results}

# LangGraph 워크플로우 정의
graph = StateGraph(dict)
graph.add_node("chatbot_agent", chatbot_agent)
graph.add_node("github_search_agent", github_search_agent)
graph.add_node("interview_questions_agent", interview_questions_agent)
graph.add_node("interview_analysis_agent", interview_analysis_agent)
graph.add_edge("__start__", "chatbot_agent")
graph.add_edge("chatbot_agent", "github_search_agent")
graph.add_edge("github_search_agent", "interview_questions_agent")
graph.add_edge("interview_questions_agent", "interview_analysis_agent")

def run_workflow(input_data):
    step1 = chatbot_agent(input_data)
    step2 = github_search_agent(step1)
    step3 = interview_questions_agent(step2)
    step4 = interview_analysis_agent(step3)
    return step4

if __name__ == "__main__":
    input_data = {
        "languages": ["Python", "JavaScript"],
        "regions": ["서울", "부산"],
        "nationwide": True,
        "headcount": 1,
        "post_id": 0
    }
    result = run_workflow(input_data)
    print("\n[최종 결과]", result)
    print("\n[Mermaid 그래프]")
    print("""
flowchart TD
    chatbot_agent --> github_search_agent --> interview_questions_agent --> interview_analysis_agent
""")