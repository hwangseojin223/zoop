import requests
import json

def test_improved_scoring():
    """개선된 점수 시스템 테스트"""
    
    # Python API 엔드포인트
    python_url = "http://localhost:8000/search"
    
    # 테스트용 필터 데이터
    test_filter = {
        "languages": ["JavaScript"],
        "regions": ["Seoul"],
        "headcount": 2,  # 2명만 테스트
        "idealCandidate": "JavaScript 개발자"
    }
    
    try:
        print("[TEST] 개선된 점수 시스템 테스트 시작...")
        
        # Python API 직접 호출
        response = requests.post(
            python_url,
            json=test_filter,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("[SUCCESS] Python API 호출 성공")
            result = response.json()
            candidates = result.get('candidates', [])
            
            print(f"\n[INFO] 분석된 후보자 수: {len(candidates)}")
            
            # 각 후보자의 점수 확인
            for i, candidate in enumerate(candidates, 1):
                print(f"\n--- 후보자 {i} ---")
                print(f"Login: {candidate.get('login')}")
                print(f"Followers: {candidate.get('followers')}")
                print(f"Public Repos: {candidate.get('public_repos')}")
                print(f"Languages: {candidate.get('details', {}).get('languages', [])}")
                print(f"LLM Score: {candidate.get('llm_score')}")
                
                # 분석 텍스트에서 점수 추출
                analysis = candidate.get('analysis', '')
                if analysis:
                    print(f"Analysis Preview: {analysis[:200]}...")
                    
                    # 점수 추출
                    import re
                    score_match = re.search(r"\(점수: (\d+)점\)", analysis)
                    if score_match:
                        extracted_score = score_match.group(1)
                        print(f"Extracted Score: {extracted_score}")
                    else:
                        print("Score not found in analysis")
                else:
                    print("No analysis available")
                    
        else:
            print(f"[ERROR] Python API 호출 실패: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    test_improved_scoring() 