#!/usr/bin/env python3

import requests
import json

def test_portfolio_questions():
    """포트폴리오 분석 결과를 포함한 면접 질문 생성 테스트"""
    
    print("🧪 포트폴리오 분석 결과를 포함한 면접 질문 생성 테스트...")
    
    # 테스트 데이터
    test_data = {
        'post_title': '프론트엔드 개발자',
        'post_description': 'React, Vue.js를 활용한 웹 애플리케이션 개발',
        'programming_language': 'JavaScript, React, Vue.js',
        'ideal_candidate': '창의적이고 사용자 경험을 중시하는 개발자',
        'location': '서울',
        'salary_range': '3000만원 ~ 5000만원',
        'headcount': 1,
        'portfolio_analysis': '''
        지원자 포트폴리오 분석 결과:
        
        강점:
        - React와 Vue.js 프로젝트 경험이 풍부함
        - 사용자 인터페이스 설계에 대한 깊은 이해
        - 반응형 웹 디자인 구현 능력이 우수함
        - Git을 활용한 협업 경험이 많음
        
        약점:
        - 백엔드 기술 스택 경험이 부족함
        - 대규모 프로젝트 관리 경험이 제한적임
        - 성능 최적화에 대한 이해가 부족할 수 있음
        
        추천 질문 방향:
        - React/Vue.js 프로젝트 경험에 대한 구체적인 질문
        - 사용자 경험 개선 사례에 대한 질문
        - 백엔드와의 협업 경험에 대한 질문
        - 성능 최적화 경험에 대한 질문
        '''
    }
    
    try:
        print("Python API 호출 중...")
        response = requests.post(
            "http://localhost:8003/generate-questions",
            data=test_data,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 면접 질문 생성 성공!")
            print(f"  - Success: {result.get('success')}")
            print(f"  - Questions:")
            for i, question in enumerate(result.get('questions', []), 1):
                print(f"    {i}. {question}")
        else:
            print(f"❌ 질문 생성 실패: {response.text}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_portfolio_questions() 