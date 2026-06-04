package com.family.hub.module.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DailyTaskRejectDTO {

    @NotNull(message = "任务ID不能为空")
    private Long id;

    @NotBlank(message = "打回原因不能为空")
    private String reason;
}
