package com.zoop.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class InterviewService {
    
    // 메모리에 지원자 상태를 저장 (실제 프로덕션에서는 Redis나 데이터베이스 사용 권장)
    private final Map<String, String> candidateStatusMap = new ConcurrentHashMap<>();
    private final Map<String, String> candidateTimestampMap = new ConcurrentHashMap<>();

    public void updateCandidateStatus(String jobCandidateId, String status, String timestamp) {
        candidateStatusMap.put(jobCandidateId, status);
        candidateTimestampMap.put(jobCandidateId, timestamp);
        
        System.out.println("지원자 상태 업데이트: " + jobCandidateId + " -> " + status + " (시간: " + timestamp + ")");
    }

    public String getCandidateStatus(String jobCandidateId) {
        String status = candidateStatusMap.getOrDefault(jobCandidateId, "waiting");
        System.out.println("지원자 상태 조회: " + jobCandidateId + " -> " + status);
        return status;
    }

    public String getCandidateTimestamp(String jobCandidateId) {
        return candidateTimestampMap.getOrDefault(jobCandidateId, "");
    }

    public void removeCandidateStatus(String jobCandidateId) {
        candidateStatusMap.remove(jobCandidateId);
        candidateTimestampMap.remove(jobCandidateId);
    }
} 