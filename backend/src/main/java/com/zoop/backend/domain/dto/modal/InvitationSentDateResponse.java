package com.zoop.backend.domain.dto.modal;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InvitationSentDateResponse {
    private LocalDateTime invitationSentDate;
}
