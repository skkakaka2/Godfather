package com.family.hub.module.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("daily_task")
public class DailyTaskEntity extends BaseEntity {

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
}
