package com.zoop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zoop.backend.domain.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAndPasswordHash(String email, String passwordHash);
}
