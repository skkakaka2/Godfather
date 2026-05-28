package com.family.hub.module.task.vo;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskStreakSummaryVO {

    private String taskName;
    private Integer streakDays;
    private LocalDate latestConfirmedDate;
    private Integer nextMilestone;
    private Integer remainingToNextMilestone;
}
