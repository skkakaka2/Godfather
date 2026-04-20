package com.family.hub.module.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task_template")
public class TaskTemplateEntity extends BaseEntity {

    private Long familyId;
    private String name;
    private String category;
    private String icon;
    private Integer defaultPoints;
    private Integer applicableSun;
    private Integer applicableMon;
    private Integer applicableTue;
    private Integer applicableWed;
    private Integer applicableThu;
    private Integer applicableFri;
    private Integer applicableSat;
    private LocalTime deadlineTime;
    private Integer sortOrder;
    private Integer enabled;
}
