package com.family.hub.module.store.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RedeemOrderScanVO {

    /** 订单ID */
    private Long id;

    /** 兑换人ID */
    private Long userId;

    /** 兑换人昵称 */
    private String userNickname;

    /** 奖励商品名称 */
    private String rewardName;

    /** 消耗积分 */
    private Integer pointsCost;

    /** 订单状态 */
    private String status;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 确认时间 */
    private LocalDateTime confirmedAt;
}
