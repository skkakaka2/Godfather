package com.family.hub.module.store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RedeemOrderScanDTO {

    /** 二维码兑换随机码 */
    @NotBlank(message = "兑换码不能为空")
    private String code;
}
