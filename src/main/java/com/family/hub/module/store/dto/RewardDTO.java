package com.family.hub.module.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RewardDTO {

    /** 奖励名称 */
    @NotBlank(message = "奖励名称不能为空")
    private String name;

    /** 奖励描述 */
    private String description;

    /** 兑换所需积分 */
    @NotNull(message = "积分价格不能为空")
    @Min(value = 1, message = "积分价格不能小于1")
    private Integer pointsPrice;

    /** 封面图URL */
    private String imageUrl;

    /** 库存数量，-1表示不限量 */
    @NotNull(message = "库存不能为空")
    @Min(value = -1, message = "库存不能小于-1")
    private Integer stock;
}
