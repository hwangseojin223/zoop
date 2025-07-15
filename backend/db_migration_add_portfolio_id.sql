-- 포트폴리오 ID 컬럼 추가
ALTER TABLE job_cand_progress ADD cand_portfolio_id NUMBER;

-- 주석 추가
COMMENT ON COLUMN job_cand_progress.cand_portfolio_id IS '후보자 포트폴리오 ID (CandidatePortfolio 테이블 참조)';

-- 데이터 확인
SELECT COUNT(*) FROM job_cand_progress; 