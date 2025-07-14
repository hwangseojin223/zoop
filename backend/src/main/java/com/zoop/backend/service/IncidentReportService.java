package com.zoop.backend.service;

import com.zoop.backend.domain.dto.IncidentReportRequestDto;
import com.zoop.backend.domain.dto.IncidentReportResponseDto;
import com.zoop.backend.domain.entity.IncidentReport;
import com.zoop.backend.repository.IncidentReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class IncidentReportService {

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    public IncidentReportResponseDto submitReport(IncidentReportRequestDto request) {
        try {
            // 입력값 검증
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return new IncidentReportResponseDto(false, "이메일은 필수 입력 항목입니다.");
            }
            
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return new IncidentReportResponseDto(false, "신고 내용은 필수 입력 항목입니다.");
            }
            
            if (request.getRole() == null || request.getRole().trim().isEmpty()) {
                return new IncidentReportResponseDto(false, "역할은 필수 입력 항목입니다.");
            }

            // 엔티티 생성
            IncidentReport incidentReport = new IncidentReport(
                request.getEmail(),
                request.getContent(),
                request.getRole(),
                request.getReporterType() != null ? request.getReporterType() : "ANONYMOUS",
                request.getReporterId()
            );

            // 데이터베이스에 저장
            IncidentReport savedReport = incidentReportRepository.save(incidentReport);

            // 성공 응답 반환
            return new IncidentReportResponseDto(
                true, 
                "신고가 성공적으로 접수되었습니다. 검토 후 연락드리겠습니다.",
                savedReport.getId()
            );

        } catch (Exception e) {
            // 로그 기록 (실제 운영환경에서는 로깅 프레임워크 사용)
            System.err.println("신고 접수 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            return new IncidentReportResponseDto(false, "신고 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
} 