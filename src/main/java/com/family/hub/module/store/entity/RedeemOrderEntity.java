package com.family.hub.module.store.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("redeem_order")
public class RedeemOrderEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 兑换人ID */
    private Long userId;

    /** 奖励商品ID */
    private Long rewardId;

    /** 消耗积分 */
    private Integer pointsCost;

    /** 状态：PENDING-待审批、APPROVED-已通过、REJECTED-已拒绝 */
    private String status;

    /** 备注 */
    private String remark;

    /** 乐观锁版本号 */
    @Version
    private Integer version;
}
