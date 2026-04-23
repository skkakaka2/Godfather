package com.family.hub.module.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DailyTaskConfirmDTO {

    @NotNull(message = "任务ID不能为空")
    private Long id;

    /**
     * 调整积分（默认用任务原积分）
     */
    private Integer points;

    /**
     * 确认备注
     */
    private String remark;
}
