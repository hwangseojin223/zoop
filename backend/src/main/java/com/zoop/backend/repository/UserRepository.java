package com.zoop.backend.repository;

import com.zoop.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAndPasswordHash(String email, String passwordHash);
}
