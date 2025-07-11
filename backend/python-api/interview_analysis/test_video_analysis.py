#!/usr/bin/env python3
"""
개별 영상 분석 테스트 스크립트
"""

import requests
import json

# 설정
PYTHON_API_URL = "http://localhost:8001"
SPRING_API_URL = "http://localhost:8081"

def test_health_check():
    """헬스 체크 테스트"""
    print("=== Health Check Test ===")
    try:
        response = requests.get(f"{PYTHON_API_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_video():
    """영상 정보 조회 테스트"""
    print("\n=== Get Video Test ===")
    try:
        # 실제 DB에 있는 video_id 사용 (28, 29, 30 중 하나)
        video_id = 28
        response = requests.get(f"{SPRING_API_URL}/api/interview-videos/{video_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            video_data = response.json()
            print(f"Video Data: {json.dumps(video_data, indent=2, ensure_ascii=False)}")
            return video_data
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_analyze_video(video_id):
    """개별 영상 분석 테스트"""
    print(f"\n=== Analyze Video Test (video_id: {video_id}) ===")
    try:
        data = {
            "video_id": video_id
        }
        response = requests.post(f"{PYTHON_API_URL}/analyze-video", data=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Analysis ID: {result.get('analysis_id')}")
            print(f"Score: {result.get('score')}")
            print(f"Analysis Data: {result.get('analysis_data', '')[:200]}...")
            return result
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_get_analysis_results():
    """분석 결과 조회 테스트"""
    print("\n=== Get Analysis Results Test ===")
    try:
        response = requests.get(f"{SPRING_API_URL}/api/ai-analysis-results")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"Found {len(results)} analysis results")
            for result in results:
                print(f"ID: {result.get('analysisId')}, Type: {result.get('analysisType')}, Score: {result.get('analysisScore')}")
            return results
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    """메인 테스트 함수"""
    print("Starting Video Analysis Tests...")
    
    # 1. 헬스 체크
    if not test_health_check():
        print("Health check failed. Exiting.")
        return
    
    # 2. 영상 정보 조회
    video_data = test_get_video()
    if not video_data:
        print("Failed to get video data. Exiting.")
        return
    
    # 3. 개별 영상 분석
    video_id = video_data.get('videoId')
    if video_id:
        analysis_result = test_analyze_video(video_id)
        if analysis_result and analysis_result.get('success'):
            print("Video analysis completed successfully!")
        else:
            print("Video analysis failed.")
    
    # 4. 분석 결과 조회
    test_get_analysis_results()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main() 