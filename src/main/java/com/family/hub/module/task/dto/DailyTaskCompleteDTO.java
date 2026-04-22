package com.family.hub.module.task.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class DailyTaskCompleteDTO {
    @NotNull(message = "任务ID不能为空")
    private Long id;

    @NotNull(message = "用户ID不能为空")
    private Long userId;
}
