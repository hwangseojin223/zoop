#!/usr/bin/env python3

import requests
import json

def check_ai_data():
    """DB에 AI 분석 결과가 실제로 저장되어 있는지 확인"""
    
    print("🔍 AI 분석 결과 DB 저장 상태 확인...")
    
    # 1. GitHub 검색 결과 조회 (정상 작동하는지 확인)
    try:
        response = requests.get(
            "http://localhost:8081/api/github-search/results",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            github_results = response.json()
            print(f"✅ GitHub 검색 결과: {len(github_results)}개")
            
            # AI 분석 ID가 있는 결과들 확인
            with_ai_analysis = [r for r in github_results if r.get('aiGithubAnalysisId')]
            print(f"  - AI 분석 ID가 있는 결과: {len(with_ai_analysis)}개")
            
            if with_ai_analysis:
                print("  - AI 분석 ID 예시:")
                for result in with_ai_analysis[:3]:
                    print(f"    * GitHub ID: {result.get('githubSearchResultId')}, AI ID: {result.get('aiGithubAnalysisId')}")
        else:
            print(f"❌ GitHub 검색 결과 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ GitHub 검색 결과 조회 오류: {e}")
    
    # 2. AI 분석 결과 직접 조회 시도 (다른 방법)
    print("\n🔍 AI 분석 결과 조회 시도...")
    
    # 방법 1: 모든 AI 분석 결과 조회
    try:
        response = requests.get(
            "http://localhost:8081/api/ai-analysis-results",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"모든 AI 분석 결과 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ AI 분석 결과 {len(results)}개 조회 성공!")
            for result in results[:3]:
                print(f"  - ID: {result.get('analysisId')}, Type: {result.get('analysisType')}, GitHub ID: {result.get('githubSearchResultId')}")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    # 방법 2: 특정 GitHub 검색 결과 ID로 AI 분석 결과 조회
    if with_ai_analysis:
        try:
            github_id = with_ai_analysis[0].get('githubSearchResultId')
            response = requests.get(
                f"http://localhost:8081/api/ai-analysis-results/github/{github_id}",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"\nGitHub ID {github_id}의 AI 분석 결과 조회 - Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"✅ AI 분석 결과 조회 성공!")
                print(f"  - ID: {result.get('analysisId')}")
                print(f"  - Type: {result.get('analysisType')}")
                print(f"  - Score: {result.get('analysisScore')}")
            else:
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ 오류: {e}")

if __name__ == "__main__":
    check_ai_data() 