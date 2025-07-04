#!/usr/bin/env python3

import requests
import json

def test_ai_analysis():
    """AI 분석 결과 조회 테스트"""
    
    print("🧪 AI 분석 결과 조회 테스트...")
    
    # 1. 모든 AI 분석 결과 조회
    try:
        response = requests.get(
            "http://localhost:8081/api/ai-analysis-results",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ AI 분석 결과 {len(results)}개 조회 성공!")
            for result in results[:3]:  # 처음 3개만 출력
                print(f"  - ID: {result.get('analysisId')}, Type: {result.get('analysisType')}")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    # 2. 특정 POST ID로 AI 분석 결과 조회
    try:
        response = requests.get(
            "http://localhost:8081/api/ai-analysis-results/post/92",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\nPOST 92 AI 분석 결과 조회:")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ POST 92 AI 분석 결과 {len(results)}개 조회 성공!")
            for result in results:
                print(f"  - ID: {result.get('analysisId')}, Type: {result.get('analysisType')}")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_ai_analysis() 