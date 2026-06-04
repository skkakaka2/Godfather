package com.family.hub.module.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("activity_bonus")
public class ActivityBonusEntity extends BaseEntity {

    /** 关联活动ID */
    private Long activityId;

    /** 加成类型: POINTS/EXPERIENCE */
    private String bonusType;

    /** 倍数，2.00=双倍 */
    private BigDecimal bonusMultiplier;
}
