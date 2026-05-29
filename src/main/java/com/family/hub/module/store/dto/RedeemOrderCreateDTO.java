package com.family.hub.module.store.dto;

import lombok.Data;

@Data
public class RedeemOrderCreateDTO {

    /** 奖励商品ID（普通兑换时必传） */
    private Long rewardId;

    /** 活动ID（特惠奖励兑换时必传） */
    private Long activityId;
}
