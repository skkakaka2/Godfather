package com.family.hub.module.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("activity_special_reward")
public class ActivitySpecialRewardEntity extends BaseEntity {

    /** 关联活动ID */
    private Long activityId;

    /** 特惠奖励名称 */
    private String rewardName;

    /** 奖励图片 */
    private String rewardImage;

    /** 血清素价格 */
    private Integer rewardPointsPrice;

    /** 奖励描述 */
    private String rewardDescription;

    /** 库存，NULL=无限 */
    private Integer rewardStock;
}
