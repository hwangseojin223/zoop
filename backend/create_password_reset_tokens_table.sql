-- password_reset_tokens 테이블 생성
CREATE TABLE password_reset_tokens (
    token VARCHAR2(255) NOT NULL,
    candidate_id NUMBER NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (token),
    CONSTRAINT fk_password_reset_tokens_candidate 
        FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

-- 인덱스 생성
CREATE INDEX idx_password_reset_tokens_candidate_id ON password_reset_tokens(candidate_id);
CREATE INDEX idx_password_reset_tokens_expiration_date ON password_reset_tokens(expiration_date); 