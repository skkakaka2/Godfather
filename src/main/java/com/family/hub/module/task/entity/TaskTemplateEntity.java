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

    /**
     * 所属家庭ID
     */
    private Long familyId;

    /**
     * 模板名称，如"语文作业"
     */
    private String name;

    /**
     * 分类：STUDY/SPORT/CHORE/HOBBY/OTHER
     */
    private String category;

    /**
     * 图标标识
     */
    private String icon;

    /**
     * 默认积分数
     */
    private Integer defaultPoints;

    /**
     * 周日是否适用：0=否，1=是
     */
    private Integer applicableSun;

    /**
     * 周一是否适用：0=否，1=是
     */
    private Integer applicableMon;

    /**
     * 周二是否适用：0=否，1=是
     */
    private Integer applicableTue;

    /**
     * 周三是否适用：0=否，1=是
     */
    private Integer applicableWed;

    /**
     * 周四是否适用：0=否，1=是
     */
    private Integer applicableThu;

    /**
     * 周五是否适用：0=否，1=是
     */
    private Integer applicableFri;

    /**
     * 周六是否适用：0=否，1=是
     */
    private Integer applicableSat;

    /**
     * 默认截止时间，如 21:00:00
     */
    private LocalTime deadlineTime;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 是否启用：0=禁用，1=启用
     */
    private Integer enabled;
}
