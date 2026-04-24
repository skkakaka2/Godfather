package com.family.hub.module.store.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("reward")
public class RewardEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 奖励名称 */
    private String name;

    /** 奖励描述 */
    private String description;

    /** 兑换所需积分 */
    private Integer pointsPrice;

    /** 封面图URL */
    private String imageUrl;

    /** 库存数量，-1表示不限量 */
    private Integer stock;

    /** 状态：ON-上架、OFF-下架 */
    private String status;

    @Version
    private int version;
}
