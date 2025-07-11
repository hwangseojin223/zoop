# Interview Analysis Service

AI 면접 영상 분석 서비스입니다. Whisper를 사용하여 영상에서 음성을 텍스트로 변환하고, OpenAI GPT-4o를 사용하여 면접 답변을 분석합니다.

## 기능

- **음성 추출**: Whisper를 사용하여 면접 영상에서 음성을 텍스트로 변환
- **답변 분석**: OpenAI GPT-4o를 사용하여 면접 답변을 종합적으로 분석
- **점수 산출**: 전문성, 의사소통 능력, 문제해결 능력, 자신감과 태도, 경험의 구체성을 기준으로 점수 부여
- **결과 저장**: 분석 결과를 Spring 백엔드의 `ai_analysis_results` 테이블에 저장

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
SPRING_API_URL=http://localhost:8081
```

### 3. 서비스 실행

```bash
# 직접 실행
python interview_analysis_api.py

# 또는 uvicorn 사용
uvicorn interview_analysis_api:app --host 0.0.0.0 --port 8002 --reload
```

### 4. 전체 서비스 시작

```bash
# 루트 디렉토리에서
./start_services.sh
```

## API 엔드포인트

### POST /analyze-interview

면접 영상을 분석합니다.

**요청 파라미터:**
- `schedule_id` (int): 면접 일정 ID
- `job_candidate_id` (int): 후보자 진행 상태 ID

**응답:**
```json
{
  "success": true,
  "analysis_id": 123,
  "score": 85.5,
  "analysis_data": "전문성: 20점 - 기술적 지식이 풍부...",
  "error": null
}
```

### GET /health

서비스 상태를 확인합니다.

**응답:**
```json
{
  "status": "healthy",
  "service": "interview-analysis"
}
```

## 분석 기준

면접 답변은 다음 5개 항목으로 평가됩니다:

1. **전문성 (25점)**: 기술적 지식과 경험의 깊이
2. **의사소통 능력 (20점)**: 명확하고 논리적인 설명 능력
3. **문제해결 능력 (20점)**: 구체적이고 실용적인 해결책 제시
4. **자신감과 태도 (15점)**: 자신감 있는 답변과 긍정적 태도
5. **경험의 구체성 (20점)**: 구체적인 사례와 경험 제시

## 데이터 흐름

1. **면접 완료**: Spring 백엔드에서 면접 완료 시 자동으로 분석 시작
2. **영상 조회**: `ai_interview_videos` 테이블에서 해당 면접의 모든 영상 조회
3. **음성 추출**: Whisper를 사용하여 각 영상에서 텍스트 추출
4. **답변 통합**: 모든 질문과 답변을 하나로 합쳐서 분석
5. **AI 분석**: OpenAI GPT-4o를 사용하여 종합 분석 및 점수 산출
6. **결과 저장**: `ai_analysis_results` 테이블에 분석 결과 저장
7. **진행 상태 업데이트**: `job_cand_progress` 테이블의 `ai_interview_analysis_id` 업데이트

## 테스트

```bash
python test_interview_analysis.py
```

## 주의사항

- Whisper 모델 로딩에 시간이 걸릴 수 있습니다 (처음 실행 시)
- 영상 파일 다운로드 및 분석에 시간이 소요될 수 있습니다
- OpenAI API 사용량에 따라 비용이 발생할 수 있습니다
- Spring 백엔드가 실행 중이어야 합니다

## 문제 해결

### Whisper 모델 로딩 실패
- 충분한 메모리가 있는지 확인
- 인터넷 연결 상태 확인

### OpenAI API 오류
- API 키가 올바른지 확인
- API 사용량 한도 확인

### Spring API 연결 실패
- Spring 백엔드가 실행 중인지 확인
- `SPRING_API_URL` 환경 변수 확인 