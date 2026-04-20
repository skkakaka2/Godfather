package com.family.hub.module.task.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTemplateDTO {

    @NotBlank(message = "模板名称不能为空")
    @Size(max = 64, message = "模板名称最长 64 位")
    private String name;

    @NotBlank(message = "分类不能为空")
    @Pattern(regexp = "STUDY|SPORT|CHORE|HOBBY|OTHER", message = "分类只能是 STUDY/SPORT/CHORE/HOBBY/OTHER")
    private String category;

    @Size(max = 32, message = "图标标识最长 32 位")
    private String icon;

    @NotNull(message = "默认积分不能为空")
    @Min(value = 0, message = "积分不能为负数")
    private Integer defaultPoints;

    @NotNull(message = "周日是否适用不能为空")
    private Integer applicableSun;

    @NotNull(message = "周一是否适用不能为空")
    private Integer applicableMon;

    @NotNull(message = "周二是否适用不能为空")
    private Integer applicableTue;

    @NotNull(message = "周三是否适用不能为空")
    private Integer applicableWed;

    @NotNull(message = "周四是否适用不能为空")
    private Integer applicableThu;

    @NotNull(message = "周五是否适用不能为空")
    private Integer applicableFri;

    @NotNull(message = "周六是否适用不能为空")
    private Integer applicableSat;

    @NotNull(message = "截止时间不能为空")
    private LocalTime deadlineTime;

    private Integer sortOrder;

    @NotNull(message = "是否启用不能为空")
    private Integer enabled;
}
