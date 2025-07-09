package com.zoop.backend.domain.dto;

public class LoginRequest {
    private String loginId;
    private String password;
    private String userType;

    // Getters & Setters
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
