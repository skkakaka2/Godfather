package com.family.hub.module.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task_checkin")
public class TaskCheckinEntity extends BaseEntity {

    private Long dailyTaskId;
    private Long userId;
    private String action;
    private String photoUrl;
    private String remark;
}
