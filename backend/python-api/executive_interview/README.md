# Executive Interview AI Analysis Service

임원면접 AI 분석을 위한 Python FastAPI 서비스입니다.

## 🚀 주요 기능

- **화자 분리 (Speaker Diarization)**: 면접 녹화에서 면접관과 지원자 구분
- **음성-텍스트 변환**: Whisper를 사용한 고품질 음성 인식
- **AI 분석**: GPT-4를 사용한 면접 내용 종합 분석
- **LangGraph 워크플로우**: 구조화된 AI 분석 프로세스
- **Spring Boot 연동**: 분석 결과를 백엔드에 자동 저장

## 📋 분석 항목

1. **전문성 (Professionalism)**: 기술적 지식, 업계 트렌드 이해도, 문제 해결 능력
2. **의사소통 능력 (Communication)**: 명확한 의사 전달, 적극적인 소통 태도
3. **팀워크 및 협업 (Teamwork)**: 협업 경험, 갈등 해결 능력, 팀 기여도
4. **성장 의지 (Growth Mindset)**: 학습 의지, 자기 개발 계획, 도전 정신
5. **문화적 적합성 (Cultural Fit)**: 회사 가치관 일치도, 업무 스타일 적합성

## 🛠️ 기술 스택

- **FastAPI**: 고성능 Python 웹 프레임워크
- **LangGraph**: AI 워크플로우 오케스트레이션
- **OpenAI GPT-4**: 고급 AI 분석 모델
- **Whisper**: 음성-텍스트 변환
- **Pyannote.audio**: 화자 분리 (Speaker Diarization)

## 📁 프로젝트 구조

```
executive_interview/
├── executive_interview_api.py      # FastAPI 메인 애플리케이션
├── executive_interview_service.py  # 핵심 비즈니스 로직
├── langgraph_workflow.py          # LangGraph 워크플로우
├── requirements.txt               # Python 패키지 의존성
├── env.example                   # 환경변수 예시
└── README.md                     # 이 파일
```

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

```bash
cp env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 3. 서비스 실행

```bash
# 직접 실행
python executive_interview_api.py

# 또는 uvicorn 사용
uvicorn executive_interview_api:app --host 0.0.0.0 --port 8006 --reload
```

### 4. 서비스 시작 스크립트 사용

```bash
# 모든 서비스 시작
cd ../../
./start_services.sh

# 서비스 중지
./stop_services.sh
```

## 🔌 API 엔드포인트

### POST `/analyze-interview`
면접 내용을 AI로 분석합니다.

**Request Body:**
```json
{
  "job_candidate_id": 123,
  "post_id": 456,
  "job_description": "IT 개발자 채용 공고 내용",
  "candidate_profile": "지원자 프로필 정보",
  "interview_recording_url": "https://example.com/recording.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "analysis_result": {
    "workflow_result": {...},
    "ai_analysis": {...},
    "final_recommendation": {...}
  },
  "workflow_status": "completed"
}
```

### POST `/analyze-interview-file`
면접 녹화 파일을 업로드하여 분석합니다.

**Form Data:**
- `job_candidate_id`: 지원자 ID
- `post_id`: 공고 ID
- `job_description`: 채용 공고 내용
- `candidate_profile`: 지원자 프로필
- `interview_file`: 면접 녹화 파일 (mp3, wav, m4a, mp4)

### GET `/workflow-status/{workflow_id}`
워크플로우 상태를 조회합니다.

### GET `/health`
서비스 헬스 체크

## 🔄 LangGraph 워크플로우

1. **면접 녹화 파일 처리**: 화자 분리 + 음성-텍스트 변환
2. **대화 내용 전처리**: 텍스트 정리, 키워드 추출, 구조 분석
3. **AI 분석 수행**: GPT-4를 사용한 종합 평가
4. **결과 요약 생성**: 최종 추천 및 다음 단계 제안

## 🔗 Spring Boot 연동

분석 결과는 자동으로 Spring Boot 백엔드의 `ai_analysis_results` 테이블에 저장됩니다:

- `analysis_type`: "executive_interview"
- `job_candidate_id`: 지원자 ID
- `analysis_data`: 전체 분석 결과 (JSON)
- `analysis_score`: AI 분석 점수

## 📊 분석 결과 예시

```json
{
  "종합 평가 점수": 8.5,
  "최종 추천": "합격",
  "강점": [
    "기술적 전문성 우수",
    "명확한 의사소통",
    "팀워크 경험 풍부"
  ],
  "개선점": [
    "업계 트렌드에 대한 추가 학습 필요",
    "프레젠테이션 스킬 향상"
  ],
  "상세 평가": "전반적으로 우수한 지원자로, 기술력과 소통 능력이 뛰어납니다..."
}
```

## 🚨 주의사항

- OpenAI API 키가 필요합니다
- 면접 녹화 파일은 지원되는 형식만 업로드 가능합니다
- Spring Boot 서비스가 실행 중이어야 결과 저장이 가능합니다

## 📞 지원

문제가 발생하거나 질문이 있으시면 개발팀에 문의해주세요. 