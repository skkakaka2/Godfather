package com.family.hub.module.activity.vo;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ActivityVO {

    private Long id;
    private Long familyId;
    private String name;
    private String description;
    private String bannerImage;
    private String type;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // === DISCOUNT ===
    private BigDecimal discountRate;

    // === SPECIAL_REWARD ===
    private String rewardName;
    private String rewardImage;
    private Integer rewardPointsPrice;
    private String rewardDescription;
    private Integer rewardStock;

    // === BONUS ===
    private String bonusType;
    private BigDecimal bonusMultiplier;
}
