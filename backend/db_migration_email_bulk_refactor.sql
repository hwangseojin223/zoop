-- =============================================
-- 이메일 일괄전송을 위한 DB 구조 개선 마이그레이션
-- =============================================

-- 1. EMAIL_CONTENTS 테이블 새로 생성 (invitation_id 없는 구조)
CREATE TABLE email_contents (
    email_id NUMBER(19,0) PRIMARY KEY,
    post_id NUMBER(19,0) NOT NULL,
    email_subject VARCHAR2(255) NOT NULL,
    email_content CLOB NOT NULL,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. EMAIL_CONTENTS 시퀀스 생성
CREATE SEQUENCE email_contents_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

-- 3. INVITATIONS 테이블에 email_contents_id 컬럼 추가
ALTER TABLE invitations 
ADD email_contents_id NUMBER(19,0);

-- 4. 외래키 제약조건 추가
ALTER TABLE invitations 
ADD CONSTRAINT FK_INVITATIONS_EMAIL_CONTENTS 
FOREIGN KEY (email_contents_id) REFERENCES email_contents(email_id);

-- EmailContents에서 Posts로의 외래키 제약조건 추가
ALTER TABLE email_contents 
ADD CONSTRAINT FK_EMAIL_CONTENTS_POST 
FOREIGN KEY (post_id) REFERENCES posts(post_id);

-- 5. 인덱스 추가 (성능 향상을 위해)
CREATE INDEX IDX_INVITATIONS_EMAIL_CONTENTS_ID ON invitations(email_contents_id);
CREATE INDEX IDX_EMAIL_CONTENTS_POST_ID ON email_contents(post_id);

COMMIT;

-- =============================================
-- 마이그레이션 확인 쿼리 (실행 후 확인용)
-- =============================================

-- 구조 확인
-- SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'INVITATIONS' ORDER BY column_id;
-- SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'EMAIL_CONTENTS' ORDER BY column_id;

-- 테이블 생성 확인
-- SELECT table_name FROM user_tables WHERE table_name IN ('INVITATIONS', 'EMAIL_CONTENTS');

-- 외래키 제약조건 확인
-- SELECT constraint_name, table_name, r_constraint_name FROM user_constraints WHERE constraint_type = 'R' AND table_name IN ('INVITATIONS', 'EMAIL_CONTENTS');

-- 시퀀스 확인  
-- SELECT sequence_name FROM user_sequences WHERE sequence_name = 'EMAIL_CONTENTS_SEQ'; 