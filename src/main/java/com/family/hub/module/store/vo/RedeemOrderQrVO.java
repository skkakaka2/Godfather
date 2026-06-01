package com.family.hub.module.store.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RedeemOrderQrVO {

    /** 订单ID */
    private Long orderId;

    /** 奖励商品名称 */
    private String rewardName;

    /** 消耗积分 */
    private Integer pointsCost;

    /** 订单状态 */
    private String status;

    /** 二维码兑换随机码 */
    private String redeemCode;

    /** 二维码内容 */
    private String payload;
}
