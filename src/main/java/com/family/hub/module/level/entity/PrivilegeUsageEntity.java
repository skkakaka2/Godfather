package com.family.hub.module.level.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("privilege_usage")
public class PrivilegeUsageEntity implements Serializable {

    private Long id;

    private Long familyId;

    private Long userId;

    /** 特权类型：DOUBLE_CARD/STREAK_SHIELD/DAILY_CHEST/WISH_DIRECT */
    private String privilegeType;

    /** 周期：2026W18/2026M04/20260430 */
    private String periodKey;

    /** 关联业务ID */
    private Long refId;

    /** 结果 */
    private String rewardResult;

    private LocalDateTime createdAt;
}
