package com.family.hub.module.store.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("endorphin_log")
public class EndorphinLogEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 用户ID */
    private Long userId;

    /** 类型：EARN-赚取、EXCHANGE-兑换 */
    private String type;

    /** 变动内啡肽数（正数增加，负数减少） */
    private Integer amount;

    /** 操作后余额 */
    private Integer balanceAfter;

    /** 关联业务ID */
    private Long refId;

    /** 说明 */
    private String remark;
}
