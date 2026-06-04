package com.family.hub.module.activity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ActivityCreateDTO {

    /** 活动名称 */
    @NotBlank(message = "活动名称不能为空")
    private String name;

    /** 活动描述 */
    private String description;

    /** Banner图片URL */
    private String bannerImage;

    /** 活动类型: DISCOUNT/SPECIAL_REWARD/BONUS */
    @NotBlank(message = "活动类型不能为空")
    private String type;

    /** 开始时间 */
    @NotNull(message = "开始时间不能为空")
    private LocalDateTime startTime;

    /** 结束时间 */
    @NotNull(message = "结束时间不能为空")
    private LocalDateTime endTime;

    // === DISCOUNT 专属 ===
    /** 折扣率，0.80=八折 */
    private BigDecimal discountRate;

    // === SPECIAL_REWARD 专属 ===
    private String rewardName;
    private String rewardImage;
    private Integer rewardPointsPrice;
    private String rewardDescription;
    private Integer rewardStock;

    // === BONUS 专属 ===
    /** 加成类型: POINTS/EXPERIENCE */
    private String bonusType;
    /** 倍数，2.00=双倍 */
    private BigDecimal bonusMultiplier;
}
