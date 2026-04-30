package com.family.hub.module.level.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChestResultVO {

    /** 开出的血清素数量 */
    private Integer points;

    /** 开出的经验数量 */
    private Integer exp;
}
