package com.family.hub.module.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task_checkin")
public class TaskCheckinEntity extends BaseEntity {

    /**
     * 关联每日任务ID
     */
    private Long dailyTaskId;

    /**
     * 操作人（打卡=孩子，确认/打回=家长）
     */
    private Long userId;

    /**
     * 操作类型：CHECKIN/CONFIRM/REJECT
     */
    private String action;

    /**
     * 照片凭证URL
     */
    private String photoUrl;

    /**
     * 备注
     */
    private String remark;
}
