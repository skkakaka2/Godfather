package com.family.hub.module.task.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTaskUpdateDTO {

    @Size(max = 64, message = "任务名称最长64位")
    private String name;

    @Size(max = 32, message = "图标标识最长32位")
    private String icon;

    @Min(value = 0, message = "积分不能为负数")
    private Integer points;

    private LocalTime deadlineTime;

    private Integer sortOrder;

    @Pattern(regexp = "PENDING|DONE|EXPIRED|SKIPPED", message = "状态只能是 PENDING/DONE/EXPIRED/SKIPPED")
    private String status;
}
