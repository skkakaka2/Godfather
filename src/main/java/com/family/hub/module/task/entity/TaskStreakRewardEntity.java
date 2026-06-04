package com.family.hub.module.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task_streak_reward")
public class TaskStreakRewardEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 用户ID */
    private Long userId;

    /** 任务模板ID */
    private Long templateId;

    /** 触发奖励的每日任务ID */
    private Long dailyTaskId;

    /** 连续确认任务日数量 */
    private Integer streakDays;

    /** 奖励内啡肽数量 */
    private Integer endorphinsAwarded;
}
