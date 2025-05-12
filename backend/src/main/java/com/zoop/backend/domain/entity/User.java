package com.zoop.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")  // 테이블 이름 명시 (대소문자 중요!)
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @Column(name = "PASSWORD_HASH")
    private String passwordHash;

    private String role;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
