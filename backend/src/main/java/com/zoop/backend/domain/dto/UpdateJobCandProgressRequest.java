package com.zoop.backend.domain.dto;

import lombok.Data;

@Data
public class UpdateJobCandProgressRequest {
    private String invitationToken;
    private Long candidateId;
} 