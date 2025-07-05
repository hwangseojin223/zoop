// Repository: AiInterviewScheduleRepository.java
package com.zoop.backend.repository;

import com.zoop.backend.domain.entity.AiInterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiInterviewScheduleRepository extends JpaRepository<AiInterviewSchedule, Long> {
    Optional<AiInterviewSchedule> findByJobCandidateId(Long jobCandidateId);
}