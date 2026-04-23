package com.family.hub.module.task.entity;

import java.util.List;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "task_checkin", autoResultMap = true)
public class TaskCheckinEntity extends BaseEntity {

    /**
     * 所属家庭ID
     */
    private Long familyId;

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
     * 照片凭证URL列表
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> photoUrls;

    /**
     * 备注
     */
    private String remark;
}
