package com.family.hub.module.store.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RedeemOrderVO {

    /** 订单ID */
    private Long id;

    /** 所属家庭ID */
    private Long familyId;

    /** 兑换人ID */
    private Long userId;

    /** 奖励商品ID */
    private Long rewardId;

    /** 关联活动ID，特惠奖励兑换时使用 */
    private Long activityId;

    /** 奖励商品名称 */
    private String rewardName;

    /** 消耗积分 */
    private Integer pointsCost;

    /** 状态：PENDING-待审批、APPROVED-已通过、REJECTED-已拒绝 */
    private String status;

    /** 备注 */
    private String remark;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
