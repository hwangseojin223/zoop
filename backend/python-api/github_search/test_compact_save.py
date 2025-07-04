import requests
import json

def test_compact_ai_analysis_save():
    """간결한 AI 분석 결과 저장 테스트"""
    
    # Spring Boot API 엔드포인트
    spring_url = "http://localhost:8080/api/github/search"
    
    # 테스트용 필터 데이터
    test_filter = {
        "postId": 1,  # 실제 존재하는 postId 사용
        "languages": ["JavaScript"],
        "regions": ["Seoul"],
        "headcount": 1,
        "idealCandidate": "JavaScript 개발자"
    }
    
    try:
        print("[TEST] Spring Boot API 호출 시작...")
        
        # Spring Boot API 호출
        response = requests.post(
            spring_url,
            json=test_filter,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("[SUCCESS] Spring Boot API 호출 성공")
            result = response.json()
            print(f"[INFO] 저장된 후보자 수: {len(result.get('candidates', []))}")
            
            # 저장된 데이터 확인
            print("\n[INFO] 저장된 후보자 정보:")
            for candidate in result.get('candidates', []):
                print(f"- Login: {candidate.get('login')}")
                print(f"- Score: {candidate.get('llm_score')}")
                print(f"- Analysis: {candidate.get('analysis', '')[:100]}...")
                print("---")
                
        else:
            print(f"[ERROR] Spring Boot API 호출 실패: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    test_compact_ai_analysis_save() 