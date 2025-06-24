package com.zoop.backend.domain.dto;

/**
 *
 * @author hwangseojin
 */
import java.util.List;

import lombok.Data;

@Data
public class CareerDataDto {
    private boolean isExperienced;
    private int totalYearsOfExperience;
    private List<WorkExperienceDto> workExperiences;
}
