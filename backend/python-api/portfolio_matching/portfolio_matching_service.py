import os
import json
import requests
from typing import List, Dict, Any
from dataclasses import dataclass
import openai

@dataclass
class PortfolioData:
    cand_portfolio_id: int
    candidate_id: int
    portfolio_file_path: str
    portfolio_content: str
    desired_job: str  # 희망 직무
    desired_region: str  # 희망 지역
    desired_salary: str  # 희망 연봉
    skills: List[str]
    experience: str
    projects: List[str]

@dataclass
class JobPostingData:
    post_id: int
    post_title: str
    post_description: str
    post_programming_language: str
    post_ideal_candidate: str
    post_region: str  # 근무 지역
    post_salary_min: int  # 최소 연봉
    post_salary_max: int  # 최대 연봉
    required_skills: List[str]

class PortfolioMatchingService:
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
        
    def analyze_portfolio(self, portfolio_file_path: str, portfolio_content: str = "", candidate_info: Dict = None) -> Dict[str, Any]:
        """
        포트폴리오 파일을 분석하여 희망 직무와 자기소개를 기준으로 기술스택, 경험, 프로젝트 등을 추출
        """
        try:
            # 파일 내용 읽기 (PDF, 텍스트 등)
            file_content = self._extract_file_content(portfolio_file_path)
            
            # 희망 근무조건과 자기소개 정보 추출
            desired_job = candidate_info.get('desired_job', '') if candidate_info else ''
            desired_region = candidate_info.get('desired_region', '') if candidate_info else ''
            desired_salary = candidate_info.get('desired_salary', '') if candidate_info else ''
            self_intro = candidate_info.get('self_intro', '') if candidate_info else ''
            
            # 분석 기준 결정: 희망직무가 있으면 희망직무 기준, 없으면 자기소개 기준
            analysis_basis = desired_job if desired_job else "자기소개"
            analysis_context = f"희망직무: {desired_job}" if desired_job else f"자기소개: {self_intro[:200]}..."
            
            # OpenAI를 사용한 포트폴리오 분석
            analysis_prompt = f"""
            다음 포트폴리오를 분석하여 JSON 형태로 결과를 반환해주세요.
            
            분석 기준: {analysis_basis}
            분석 컨텍스트: {analysis_context}
            
            파일 내용: {file_content}
            포트폴리오 설명: {portfolio_content}
            희망 직무: {desired_job}
            희망 지역: {desired_region}
            희망 연봉: {desired_salary}
            자기소개: {self_intro}
            
            다음 정보를 추출해주세요:
            - desired_job: 희망 직무 (기존 정보 사용하거나 포트폴리오에서 추출)
            - desired_region: 희망 지역
            - desired_salary: 희망 연봉 (숫자로 변환)
            - skills: {analysis_basis}에 관련된 기술스택 (프로그래밍 언어, 프레임워크, 도구 등)
            - experience: {analysis_basis}와 관련된 경력 기간 및 주요 경험
            - projects: {analysis_basis}와 관련된 주요 프로젝트 목록 (프로젝트명, 기술스택, 역할)
            - education: 학력 정보
            - strengths: {analysis_basis}에서의 강점 및 특기사항
            
            JSON 형태로 반환해주세요.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": analysis_prompt}],
                temperature=0.3
            )
            
            analysis_result = json.loads(response.choices[0].message.content)
            return analysis_result
            
        except Exception as e:
            print(f"포트폴리오 분석 중 오류: {e}")
            return {
                "desired_job": desired_job,
                "desired_region": desired_region,
                "desired_salary": desired_salary,
                "skills": [],
                "experience": "",
                "projects": [],
                "education": "",
                "strengths": []
            }
    
    def calculate_matching_score(self, portfolio_data: PortfolioData, job_data: JobPostingData) -> float:
        """
        포트폴리오와 공고 간의 매칭 점수를 계산 (0-100)
        희망 근무조건과 공고 조건을 종합적으로 고려
        """
        try:
            matching_prompt = f"""
            다음 포트폴리오와 채용공고의 매칭도를 0-100점으로 평가해주세요.
            
            [포트폴리오 정보]
            희망 직무: {portfolio_data.desired_job}
            희망 지역: {portfolio_data.desired_region}
            희망 연봉: {portfolio_data.desired_salary}
            기술스택: {portfolio_data.skills}
            경험: {portfolio_data.experience}
            프로젝트: {portfolio_data.projects}
            
            [채용공고 정보]
            제목: {job_data.post_title}
            설명: {job_data.post_description}
            요구 기술: {job_data.post_programming_language}
            인재상: {job_data.post_ideal_candidate}
            근무 지역: {job_data.post_region}
            연봉 범위: {job_data.post_salary_min}~{job_data.post_salary_max}
            필요 기술: {job_data.required_skills}
            
            다음 기준으로 평가해주세요:
            1. 직무 일치도 (25점): 희망 직무와 공고 직무의 일치도
            2. 지역 일치도 (15점): 희망 지역과 근무 지역의 일치도
            3. 연봉 적합성 (10점): 희망 연봉과 공고 연봉 범위의 적합성
            4. 기술스택 일치도 (25점): 포트폴리오 기술과 공고 요구 기술의 일치도
            5. 경험과 요구사항 일치도 (15점): 경험과 공고 요구사항의 일치도
            6. 프로젝트와 업무 적합성 (10점): 프로젝트와 공고 업무의 적합성
            
            점수만 숫자로 반환해주세요 (예: 85).
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": matching_prompt}],
                temperature=0.2
            )
            
            score = float(response.choices[0].message.content.strip())
            return min(max(score, 0), 100)  # 0-100 범위로 제한
            
        except Exception as e:
            print(f"매칭 점수 계산 중 오류: {e}")
            return 0.0
    
    def match_portfolio_with_all_jobs(self, portfolio_data: PortfolioData, active_jobs: List[JobPostingData]) -> List[Dict[str, Any]]:
        """
        포트폴리오를 모든 활성 공고와 매칭 (희망 근무조건 고려)
        """
        matches = []
        
        for job in active_jobs:
            match_score = self.calculate_matching_score(portfolio_data, job)
            
            # 희망 근무조건과 일치하는 경우에만 높은 점수 부여
            if self._check_basic_compatibility(portfolio_data, job):
                if match_score >= 30:  # 30점 이상만 매칭 결과에 포함
                    matches.append({
                        "cand_portfolio_id": portfolio_data.cand_portfolio_id,
                        "post_id": job.post_id,
                        "match_score": match_score,
                        "match_status": "PENDING"
                    })
        
        # 점수 순으로 정렬
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches
    
    def _check_basic_compatibility(self, portfolio_data: PortfolioData, job_data: JobPostingData) -> bool:
        """
        기본적인 호환성 검사 (직무, 지역, 연봉)
        """
        # 직무 일치도 확인
        job_match = (portfolio_data.desired_job.lower() in job_data.post_title.lower() or 
                    job_data.post_title.lower() in portfolio_data.desired_job.lower())
        
        # 지역 일치도 확인 (간단한 문자열 포함 검사)
        region_match = (portfolio_data.desired_region.lower() in job_data.post_region.lower() or 
                       job_data.post_region.lower() in portfolio_data.desired_region.lower())
        
        # 연봉 적합성 확인
        try:
            desired_salary = int(portfolio_data.desired_salary.replace(',', '').replace('만원', ''))
            salary_match = (job_data.post_salary_min <= desired_salary <= job_data.post_salary_max)
        except:
            salary_match = True  # 연봉 정보가 없으면 기본적으로 통과
        
        return job_match or region_match or salary_match
    
    def _extract_file_content(self, file_path: str) -> str:
        """
        파일에서 텍스트 내용 추출 (PDF, 텍스트 파일 등)
        """
        try:
            # 파일 확장자에 따른 처리
            if file_path.endswith('.pdf'):
                # PDF 처리 로직
                return self._extract_pdf_content(file_path)
            elif file_path.endswith(('.txt', '.md')):
                # 텍스트 파일 처리
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                return ""
        except Exception as e:
            print(f"파일 내용 추출 중 오류: {e}")
            return ""
    
    def _extract_pdf_content(self, pdf_path: str) -> str:
        """
        PDF 파일에서 텍스트 추출
        """
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            print(f"PDF 내용 추출 중 오류: {e}")
            return ""

# 사용 예시
if __name__ == "__main__":
    service = PortfolioMatchingService()
    
    # 포트폴리오 분석 (희망 근무조건 + 자기소개 포함)
    candidate_info = {
        "desired_job": "백엔드 개발자",
        "desired_region": "서울",
        "desired_salary": "4000만원",
        "self_intro": "Java와 Spring Boot를 주로 사용하는 백엔드 개발자입니다. 3년간 다양한 프로젝트를 진행했으며, RESTful API 설계와 데이터베이스 최적화에 강점이 있습니다."
    }
    
    portfolio_analysis = service.analyze_portfolio(
        portfolio_file_path="sample_portfolio.pdf",
        portfolio_content="백엔드 개발자 포트폴리오입니다.",
        candidate_info=candidate_info
    )
    
    print("포트폴리오 분석 결과:", portfolio_analysis) 