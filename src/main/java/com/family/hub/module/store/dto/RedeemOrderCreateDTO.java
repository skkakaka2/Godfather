package com.family.hub.module.store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RedeemOrderCreateDTO {

    /** 奖励商品ID */
    @NotNull(message = "奖励商品ID不能为空")
    private Long rewardId;
}
