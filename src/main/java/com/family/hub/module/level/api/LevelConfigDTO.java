package com.family.hub.module.level.api;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 等级配置 DTO，用于跨模块传递等级加成信息，不暴露 LevelConfigEntity。
 */
@Data
@AllArgsConstructor
public class LevelConfigDTO {

    private Integer bonusPercent;
}
