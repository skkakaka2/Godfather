package com.family.hub.module.level.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("experience_log")
public class ExperienceLogEntity extends BaseEntity {

    private Long familyId;

    private Long userId;

    /** 变动经验 */
    private Integer amount;

    /** 变动后累计经验 */
    private Integer expAfter;

    /** 来源：TASK_CONFIRM/TASK_STREAK/DAILY_SIGN/CHEST/SUB_LEVEL_UP/MANUAL */
    private String source;

    /** 关联业务ID */
    private Long refId;

    /** 说明 */
    private String remark;
}
