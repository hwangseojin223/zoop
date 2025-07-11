#!/usr/bin/env python3

import requests
import json

def check_interview_data():
    """실제 DB에서 면접 관련 데이터 확인"""
    
    print("🔍 실제 DB 데이터 확인...")
    
    # 1. 면접 일정 조회 (올바른 엔드포인트)
    try:
        response = requests.get(
            "http://localhost:8081/api/interview-schedules",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"면접 일정 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            schedules = response.json()
            print(f"✅ 면접 일정 {len(schedules)}개 조회 성공!")
            for schedule in schedules[:5]:  # 처음 5개만 출력
                print(f"  - Schedule ID: {schedule.get('scheduleId')}")
                print(f"    Job Candidate ID: {schedule.get('jobCandidateId')}")
                print(f"    Status: {schedule.get('status')}")
                print(f"    Scheduled Time: {schedule.get('scheduledTime')}")
                print()
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 면접 일정 조회 오류: {e}")
    
    # 2. 면접 영상 조회 (올바른 엔드포인트)
    try:
        response = requests.get(
            "http://localhost:8081/api/interview-videos",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"면접 영상 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            videos = response.json()
            print(f"✅ 면접 영상 {len(videos)}개 조회 성공!")
            for video in videos[:5]:  # 처음 5개만 출력
                print(f"  - Video ID: {video.get('videoId')}")
                print(f"    Schedule ID: {video.get('aiInterviewSchedule', {}).get('scheduleId')}")
                print(f"    Question Number: {video.get('questionNumber')}")
                print(f"    Question Content: {video.get('questionContent')}")
                print(f"    Video Path: {video.get('videoFilePath')}")
                print()
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 면접 영상 조회 오류: {e}")
    
    # 3. AI 분석 결과 조회
    try:
        response = requests.get(
            "http://localhost:8081/api/ai-analysis-results/type/interview",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"면접 분석 결과 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ 면접 분석 결과 {len(results)}개 조회 성공!")
            for result in results[:3]:  # 처음 3개만 출력
                print(f"  - Analysis ID: {result.get('analysisId')}")
                print(f"    Job Candidate ID: {result.get('jobCandidateId')}")
                print(f"    Score: {result.get('analysisScore')}")
                print(f"    Analysis Data: {result.get('analysisData', '')[:100]}...")
                print()
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ 면접 분석 결과 조회 오류: {e}")

def check_specific_schedule(schedule_id):
    """특정 면접 일정의 영상 확인"""
    
    print(f"🎥 Schedule ID {schedule_id}의 영상 확인...")
    
    try:
        response = requests.get(
            f"http://localhost:8081/api/interview-videos/schedule/{schedule_id}",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            videos = response.json()
            print(f"✅ Schedule {schedule_id}의 영상 {len(videos)}개 조회 성공!")
            for video in videos:
                print(f"  - Video ID: {video.get('videoId')}")
                print(f"    Question Number: {video.get('questionNumber')}")
                print(f"    Question Content: {video.get('questionContent')}")
                print(f"    Video Path: {video.get('videoFilePath')}")
                print()
            return videos
        else:
            print(f"Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ 오류: {e}")
        return []

if __name__ == "__main__":
    check_interview_data()
    
    # 실제 데이터가 있다면 첫 번째 schedule로 테스트
    print("\n" + "="*50)
    print("실제 데이터로 테스트할 Schedule ID를 입력하세요:")
    schedule_id = input("Schedule ID: ").strip()
    
    if schedule_id:
        videos = check_specific_schedule(int(schedule_id))
        if videos:
            print(f"\n이 Schedule ID {schedule_id}로 분석 테스트를 진행할 수 있습니다!")
        else:
            print(f"Schedule ID {schedule_id}에 영상이 없습니다.") 