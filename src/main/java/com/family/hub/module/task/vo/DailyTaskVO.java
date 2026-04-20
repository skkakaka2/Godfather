package com.family.hub.module.task.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class DailyTaskVO {

    private Long id;
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
}
