package com.family.hub.module.task.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DailyTaskCompleteDTO {

    @NotNull(message = "任务ID不能为空")
    private Long id;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 照片凭证URL列表
     */
    private List<String> photoUrls = List.of();

    /**
     * 打卡备注
     */
    private String remark;
}
