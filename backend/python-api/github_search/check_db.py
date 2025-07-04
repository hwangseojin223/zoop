#!/usr/bin/env python3

import requests
import json

def check_db_status():
    """DB 상태 확인"""
    
    print("🔍 DB 상태 확인 중...")
    
    # 1. POST 테이블 확인
    try:
        response = requests.get(
            "http://localhost:8081/api/postings/all",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            posts = response.json()
            print(f"✅ POST 테이블에 {len(posts)}개의 공고가 있습니다.")
            for post in posts:
                print(f"  - POST_ID: {post.get('postId')}, 제목: {post.get('postTitle')}")
        else:
            print(f"❌ POST 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ POST 조회 오류: {e}")
    
    # 2. GitHub 검색 결과 확인
    try:
        response = requests.get(
            "http://localhost:8081/api/github-search/results",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ GitHub 검색 결과 테이블에 {len(results)}개의 결과가 있습니다.")
        else:
            print(f"❌ GitHub 검색 결과 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ GitHub 검색 결과 조회 오류: {e}")
    
    # 3. AI 분석 결과 확인
    try:
        response = requests.get(
            "http://localhost:8081/api/ai-analysis-results",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ AI 분석 결과 테이블에 {len(results)}개의 결과가 있습니다.")
        else:
            print(f"❌ AI 분석 결과 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ AI 분석 결과 조회 오류: {e}")

if __name__ == "__main__":
    check_db_status() 