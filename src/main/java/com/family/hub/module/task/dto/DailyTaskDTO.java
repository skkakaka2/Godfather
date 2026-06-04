package com.family.hub.module.task.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class DailyTaskDTO {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    private Long templateId;

    @NotNull(message = "任务日期不能为空")
    private LocalDate taskDate;

    @NotBlank(message = "任务名称不能为空")
    @Size(max = 64, message = "任务名称最长64位")
    private String name;

    @NotBlank(message = "分类不能为空")
    @Pattern(regexp = "STUDY|SPORT|CHORE|HOBBY|TALENT|OTHER", message = "分类只能是 STUDY/SPORT/CHORE/HOBBY/TALENT/OTHER")
    private String category;

    @Size(max = 32, message = "图标标识最长32位")
    private String icon;

    @NotNull(message = "积分不能为空")
    @Min(value = 0, message = "积分不能为负数")
    private Integer points;

    private LocalTime deadlineTime;

    private Integer sortOrder;

    private Integer isTemp;
}
