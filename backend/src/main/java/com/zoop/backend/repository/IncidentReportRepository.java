package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    
    // 신고자 타입별 조회
    List<IncidentReport> findByReporterType(String reporterType);
    
    // 상태별 조회
    List<IncidentReport> findByStatus(String status);
    
    // 신고자 ID별 조회
    List<IncidentReport> findByReporterId(Long reporterId);
    
    // 이메일별 조회
    List<IncidentReport> findByEmail(String email);
    
    // 신고자 타입과 상태별 조회
    List<IncidentReport> findByReporterTypeAndStatus(String reporterType, String status);
} 