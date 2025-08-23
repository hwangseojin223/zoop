-- 임원면접 결과 테이블
CREATE TABLE executive_interview_results (
    result_id NUMBER(10) PRIMARY KEY,
    schedule_id NUMBER(10) NOT NULL,           -- 면접 일정 ID
    evaluation_score NUMBER(5,2),              -- 수동 평가 점수 (선택사항)
    evaluation_notes CLOB,                     -- 수동 평가 메모 (선택사항)
    final_decision VARCHAR2(20),               -- 'PASS', 'FAIL'
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_executive_interview_results_schedule 
        FOREIGN KEY (schedule_id) 
        REFERENCES executive_interview_schedules(schedule_id)
);

-- 시퀀스 생성
CREATE SEQUENCE executive_interview_results_seq 
    START WITH 1 
    INCREMENT BY 1;

-- 인덱스 생성
CREATE INDEX idx_executive_interview_results_schedule_id 
    ON executive_interview_results(schedule_id); 