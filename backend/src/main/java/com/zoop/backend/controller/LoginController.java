package com.zoop.backend.controller;

import com.zoop.backend.domain.User;
import com.zoop.backend.dto.LoginRequest;
import com.zoop.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {

    private final UserRepository userRepository;

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        System.out.println("이메일: " + request.getEmail());
        System.out.println("비밀번호: " + request.getPassword());
    
        User user = userRepository.findByEmailAndPasswordHash(
            request.getEmail(),
            request.getPassword()
        );
        return user != null ? "로그인 성공" : "로그인 실패";
    }
    
}
