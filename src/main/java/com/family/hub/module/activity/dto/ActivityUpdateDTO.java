package com.family.hub.module.activity.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ActivityUpdateDTO {

    private String name;
    private String description;
    private String bannerImage;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // === DISCOUNT 专属 ===
    private BigDecimal discountRate;

    // === SPECIAL_REWARD 专属 ===
    private String rewardName;
    private String rewardImage;
    private Integer rewardPointsPrice;
    private String rewardDescription;
    private Integer rewardStock;

    // === BONUS 专属 ===
    private String bonusType;
    private BigDecimal bonusMultiplier;
}
