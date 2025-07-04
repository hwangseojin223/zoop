#!/usr/bin/env python3

import requests
import json

def test_save():
    """저장 테스트"""
    
    # Spring Boot API 호출
    payload = {
        "postId": 1,
        "languages": ["Python"],
        "regions": ["서울"],
        "nationwide": False,
        "headcount": 1,
        "idealCandidate": "백엔드 개발자"
    }
    
    print("🔗 Spring Boot API 호출...")
    try:
        response = requests.post(
            "http://localhost:8080/api/github-search",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60  # 60초 타임아웃
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ 저장 성공!")
        else:
            print("❌ 저장 실패!")
            
    except requests.exceptions.Timeout:
        print("⏰ 타임아웃 - 저장 중 시간이 오래 걸렸습니다.")
    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_save() 