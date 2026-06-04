package com.family.hub.module.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EndorphinExchangeDTO {

    /** 兑换内啡肽数量 */
    @NotNull(message = "兑换数量不能为空")
    @Min(value = 1, message = "兑换数量不能小于1")
    private Integer amount;
}
