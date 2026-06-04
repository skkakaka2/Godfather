package com.family.hub.module.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("activity_discount")
public class ActivityDiscountEntity extends BaseEntity {

    /** 关联活动ID */
    private Long activityId;

    /** 折扣率，0.80=八折 */
    private BigDecimal discountRate;
}
