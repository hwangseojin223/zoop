#!/usr/bin/env python3

import requests
import json

def get_available_schedules():
    """분석 가능한 면접 일정 조회"""
    
    print("🔍 분석 가능한 면접 일정 조회...")
    
    try:
        response = requests.get(
            "http://localhost:8081/api/interview-schedules",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            schedules = response.json()
            print(f"✅ 면접 일정 {len(schedules)}개 조회 성공!")
            
            available_schedules = []
            for schedule in schedules:
                schedule_id = schedule.get('scheduleId')
                job_candidate_id = schedule.get('jobCandidateId')
                status = schedule.get('status')
                
                print(f"  - Schedule ID: {schedule_id}")
                print(f"    Job Candidate ID: {job_candidate_id}")
                print(f"    Status: {status}")
                
                # 영상이 있는지 확인
                videos_response = requests.get(
                    f"http://localhost:8081/api/interview-videos/schedule/{schedule_id}",
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if videos_response.status_code == 200:
                    videos = videos_response.json()
                    if videos:
                        print(f"    ✅ 영상 {len(videos)}개 있음")
                        available_schedules.append({
                            'schedule_id': schedule_id,
                            'job_candidate_id': job_candidate_id,
                            'video_count': len(videos)
                        })
                    else:
                        print(f"    ❌ 영상 없음")
                else:
                    print(f"    ❌ 영상 조회 실패")
                print()
            
            return available_schedules
        else:
            print(f"❌ 면접 일정 조회 실패: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ 오류: {e}")
        return []

def test_interview_analysis_with_real_data(schedule_id, job_candidate_id):
    """실제 데이터로 면접 분석 테스트"""
    
    print(f"🧪 실제 데이터로 면접 분석 테스트...")
    print(f"Schedule ID: {schedule_id}")
    print(f"Job Candidate ID: {job_candidate_id}")
    
    try:
        # Form data로 요청
        data = {
            'schedule_id': schedule_id,
            'job_candidate_id': job_candidate_id
        }
        
        print("Python API 호출 중...")
        response = requests.post(
            "http://localhost:8002/analyze-interview",
            data=data,
            timeout=300  # 5분 타임아웃
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 면접 분석 성공!")
            print(f"  - Analysis ID: {result.get('analysis_id')}")
            print(f"  - Score: {result.get('score')}")
            print(f"  - Analysis Data:")
            print(f"    {result.get('analysis_data', '')}")
            
            # Spring DB에서 결과 확인
            print(f"\n🔍 Spring DB에서 결과 확인...")
            spring_response = requests.get(
                f"http://localhost:8081/api/ai-analysis-results/{result.get('analysis_id')}",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if spring_response.status_code == 200:
                spring_result = spring_response.json()
                print(f"✅ Spring DB 저장 확인!")
                print(f"  - Analysis ID: {spring_result.get('analysisId')}")
                print(f"  - Score: {spring_result.get('analysisScore')}")
                print(f"  - Type: {spring_result.get('analysisType')}")
            else:
                print(f"❌ Spring DB 조회 실패: {spring_response.status_code}")
                
        else:
            print(f"❌ 분석 실패: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")

def main():
    print("🎥 실제 DB 데이터로 면접 분석 테스트")
    print("="*50)
    
    # 1. 분석 가능한 면접 일정 조회
    available_schedules = get_available_schedules()
    
    if not available_schedules:
        print("❌ 분석할 수 있는 면접 일정이 없습니다.")
        print("먼저 면접을 진행하고 영상을 업로드해주세요.")
        return
    
    # 2. 사용자가 선택
    print(f"\n분석할 면접 일정을 선택하세요:")
    for i, schedule in enumerate(available_schedules):
        print(f"{i+1}. Schedule ID: {schedule['schedule_id']} (영상 {schedule['video_count']}개)")
    
    try:
        choice = int(input("\n선택 (번호): ")) - 1
        if 0 <= choice < len(available_schedules):
            selected = available_schedules[choice]
            test_interview_analysis_with_real_data(
                selected['schedule_id'], 
                selected['job_candidate_id']
            )
        else:
            print("❌ 잘못된 선택입니다.")
    except ValueError:
        print("❌ 숫자를 입력해주세요.")

if __name__ == "__main__":
    main() 