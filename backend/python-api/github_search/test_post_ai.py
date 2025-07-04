#!/usr/bin/env python3

import requests
import json

def test_post_ai():
    """POST ID로 AI 분석 결과 조회 테스트"""
    
    print("🧪 POST ID로 AI 분석 결과 조회 테스트...")
    
    # POST ID 92로 테스트 (실제 데이터가 있는 POST ID)
    post_id = 92
    
    try:
        response = requests.get(
            f"http://localhost:8081/api/ai-analysis-results/post/{post_id}",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"POST {post_id} AI 분석 결과 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ POST {post_id} AI 분석 결과 {len(results)}개 조회 성공!")
            for result in results:
                print(f"  - ID: {result.get('analysisId')}, Type: {result.get('analysisType')}, GitHub ID: {result.get('githubSearchResultId')}")
                print(f"    Score: {result.get('analysisScore')}")
                if result.get('analysisData'):
                    try:
                        data = json.loads(result.get('analysisData'))
                        print(f"    Analysis: {data.get('analysis', 'N/A')[:100]}...")
                    except:
                        print(f"    Analysis Data: {result.get('analysisData')[:100]}...")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    # 다른 POST ID도 테스트
    for test_post_id in [91, 90, 89]:
        try:
            response = requests.get(
                f"http://localhost:8081/api/ai-analysis-results/post/{test_post_id}",
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                results = response.json()
                print(f"POST {test_post_id}: {len(results)}개 AI 분석 결과")
            else:
                print(f"POST {test_post_id}: 조회 실패 ({response.status_code})")
                
        except Exception as e:
            print(f"POST {test_post_id}: 오류 - {e}")

if __name__ == "__main__":
    test_post_ai() 