package com.family.hub.module.store.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("point_log")
public class PointLogEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 用户ID */
    private Long userId;

    /** 类型：EARN-赚取、REDEEM-兑换、MANUAL_ADD-手动增加、MANUAL_SUB-手动扣减、FREEZE-冻结、UNFREEZE-解冻退还、ENDORPHIN_EXCHANGE-内啡肽兑换 */
    private String type;

    /** 变动积分数（正数增加，负数减少） */
    private Integer amount;

    /** 操作后余额 */
    private Integer balanceAfter;

    /** 关联业务ID（任务ID/订单ID等） */
    private Long refId;

    /** 说明 */
    private String remark;
}
