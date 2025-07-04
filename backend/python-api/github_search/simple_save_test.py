#!/usr/bin/env python3

import requests
import json

def simple_save_test():
    """간단한 저장 테스트"""
    
    print("🧪 간단한 저장 테스트 시작...")
    
    # 1. 먼저 POST가 있는지 확인
    try:
        response = requests.get("http://localhost:8081/api/postings/all", timeout=10)
        if response.status_code == 200:
            posts = response.json()
            if not posts:
                print("❌ POST 테이블에 데이터가 없습니다. 먼저 공고를 생성해주세요.")
                return
            post_id = posts[0]['postId']
            print(f"✅ 사용할 POST_ID: {post_id}")
        else:
            print("❌ POST 조회 실패")
            return
    except Exception as e:
        print(f"❌ POST 조회 오류: {e}")
        return
    
    # 2. GitHub 검색 결과 직접 저장 테스트
    github_data = {
        "postId": post_id,
        "githubLogin": "test_user_" + str(int(time.time())),  # 유니크한 로그인명
        "githubProfileUrl": "https://github.com/test_user",
        "candidateEmail": "test@example.com",
        "analysisScore": 85.5,
        "aiGithubAnalysisId": None
    }
    
    print(f"📝 GitHub 검색 결과 저장 시도: {github_data}")
    
    try:
        response = requests.post(
            "http://localhost:8081/api/github-search/results",
            json=github_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ GitHub 검색 결과 저장 성공!")
            saved_result = response.json()
            
            # 3. AI 분석 결과 저장 테스트
            ai_data = {
                "analysisType": "github",
                "githubSearchResultId": saved_result['githubSearchResultId'],
                "analysisData": json.dumps({
                    "analysis": "테스트 분석 결과",
                    "details": {"languages": ["Python", "Java"]}
                }),
                "analysisScore": 85.5
            }
            
            print(f"📝 AI 분석 결과 저장 시도: {ai_data}")
            
            ai_response = requests.post(
                "http://localhost:8081/api/ai-analysis-results",
                json=ai_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"AI Status: {ai_response.status_code}")
            print(f"AI Response: {ai_response.text}")
            
            if ai_response.status_code == 201:
                print("✅ AI 분석 결과 저장 성공!")
            else:
                print("❌ AI 분석 결과 저장 실패!")
        else:
            print("❌ GitHub 검색 결과 저장 실패!")
            
    except Exception as e:
        print(f"❌ 저장 테스트 오류: {e}")

if __name__ == "__main__":
    import time
    simple_save_test() 