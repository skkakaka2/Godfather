package com.family.hub.module.store.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RewardVO {

    /** 奖励ID */
    private Long id;

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

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
