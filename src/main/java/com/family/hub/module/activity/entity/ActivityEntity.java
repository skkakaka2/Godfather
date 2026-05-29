package com.family.hub.module.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("activity")
public class ActivityEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 活动名称 */
    private String name;

    /** 活动描述 */
    private String description;

    /** Banner图片URL */
    private String bannerImage;

    /** 活动类型: DISCOUNT/SPECIAL_REWARD/BONUS */
    private String type;

    /** 状态: DRAFT/ACTIVE/EXPIRED */
    private String status;

    /** 开始时间 */
    private LocalDateTime startTime;

    /** 结束时间 */
    private LocalDateTime endTime;
}
