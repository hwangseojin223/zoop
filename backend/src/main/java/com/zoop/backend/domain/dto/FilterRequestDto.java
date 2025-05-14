package com.zoop.backend.domain.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class FilterRequestDto {
    private Long postId;
    private List<String> roles;
    private List<String> languages;
    private List<String> regions;
    private boolean nationwide;
    private int salary;
    private int headcount;
}
