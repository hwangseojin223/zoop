import requests
import json

def check_compact_ai_analysis_data():
    """DB에 저장된 간결한 AI 분석 데이터 확인"""
    
    # Spring Boot API 엔드포인트
    spring_url = "http://localhost:8080/api/candidates"
    
    try:
        print("[TEST] 저장된 후보자 데이터 확인...")
        
        # Spring Boot API 호출
        response = requests.get(spring_url)
        
        if response.status_code == 200:
            print("[SUCCESS] 후보자 데이터 조회 성공")
            candidates = response.json()
            
            print(f"\n[INFO] 총 후보자 수: {len(candidates)}")
            
            # AI 분석 결과 확인
            for i, candidate in enumerate(candidates, 1):
                print(f"\n--- 후보자 {i} ---")
                print(f"Login: {candidate.get('githubLogin')}")
                print(f"Email: {candidate.get('candidateEmail')}")
                print(f"Score: {candidate.get('analysisScore')}")
                
                # AI 분석 결과 확인
                aiAnalysis = candidate.get('aiAnalysis')
                if aiAnalysis:
                    print("AI 분석 결과:")
                    analysisData = aiAnalysis.get('analysisData')
                    if analysisData:
                        try:
                            # JSON 파싱
                            data = json.loads(analysisData)
                            print(f"  - Followers: {data.get('followers', 'N/A')}")
                            print(f"  - Top Language: {data.get('top_language', 'N/A')}")
                            languages = data.get('languages', [])
                            if isinstance(languages, list):
                                print(f"  - Languages: {languages}")
                            else:
                                print(f"  - Languages: {languages}")
                            print(f"  - Analysis: {data.get('analysis', 'N/A')[:200]}...")
                        except json.JSONDecodeError:
                            print(f"  - Raw Data: {analysisData[:200]}...")
                    else:
                        print("  - Analysis Data: None")
                else:
                    print("AI 분석 결과: 없음")
                    
        else:
            print(f"[ERROR] 후보자 데이터 조회 실패: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] 확인 중 오류 발생: {e}")

if __name__ == "__main__":
    check_compact_ai_analysis_data() 