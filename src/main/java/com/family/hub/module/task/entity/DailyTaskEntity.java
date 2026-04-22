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

    /**
     * 所属家庭ID
     */
    private Long familyId;

    /**
     * 分配给哪个孩子（用户ID）
     */
    private Long userId;

    /**
     * 关联模板ID，临时任务为NULL
     */
    private Long templateId;

    /**
     * 任务日期
     */
    private LocalDate taskDate;

    /**
     * 任务名称（冗余快照）
     */
    private String name;

    /**
     * 分类：STUDY/SPORT/CHORE/HOBBY/TALENT/OTHER
     */
    private String category;

    /**
     * 图标标识
     */
    private String icon;

    /**
     * 完成可得积分
     */
    private Integer points;

    /**
     * 截止时间（可覆盖模板默认值）
     */
    private LocalTime deadlineTime;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 状态：PENDING/COMPLETED/CONFIRMED/REJECTED/SETTLED
     */
    private String status;

    /**
     * 是否临时任务：0=模板生成，1=临时任务
     */
    private Integer isTemp;

    /**
     * 是否已发送超时提醒：0=未提醒，1=已提醒
     */
    private Integer reminded;
}
