package com.zoop.backend.domain.dto;

import lombok.Data;

/**
 *
 * @author hwangseojin
 */
@Data
public class WorkExperienceDto {
    private String companyName;
    private String jobTitle;
    private String startDate;
    private String endDate;
    private boolean currentlyWorking;
}
