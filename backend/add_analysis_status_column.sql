-- ai_interview_schedules 테이블에 분석 상태 컬럼 추가
ALTER TABLE ai_interview_schedules ADD ai_analysis_status VARCHAR2(20) DEFAULT 'pending';

-- 기존 데이터는 pending으로 설정
UPDATE ai_interview_schedules SET ai_analysis_status = 'pending' WHERE ai_analysis_status IS NULL;

-- 컬럼을 NOT NULL로 설정
ALTER TABLE ai_interview_schedules MODIFY ai_analysis_status VARCHAR2(20) NOT NULL;

-- 인덱스 추가 (선택사항)
CREATE INDEX idx_ai_interview_schedules_status ON ai_interview_schedules(ai_analysis_status);

-- 확인용 쿼리
SELECT ai_intrvw_schedule_id, ai_analysis_status FROM ai_interview_schedules ORDER BY ai_intrvw_schedule_id; 