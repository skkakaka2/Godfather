package com.family.hub.module.task.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyTaskVO {

    private Long id;
    private Long familyId;
    private Long userId;
    private Long templateId;
    private LocalDate taskDate;
    private String name;
    private String category;
    private String icon;
    private Integer points;
    private LocalTime deadlineTime;
    private Integer sortOrder;
    private String status;
    private Integer isTemp;
    private Integer reminded;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
