package com.family.hub.module.level.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("level_config")
public class LevelConfigEntity extends BaseEntity {

    private Long familyId;

    /** 大等级 1-10 */
    private Integer level;

    /** 小阶段 1-低等 2-中等 3-高等 */
    private Integer subLevel;

    /** 完整称号 */
    private String title;

    /** 达到该阶段所需累计经验 */
    private Integer expRequired;

    /** 升入该小阶段奖励血清素 */
    private Integer subReward;

    /** 血清素加成% */
    private Integer bonusPercent;

    /** 每日签到额外血清素 */
    private Integer dailySignBonus;

    /** 每月连击护盾次数 */
    private Integer streakShield;

    /** 每周翻倍卡张数 */
    private Integer doubleCard;

    /** 每日宝箱 */
    private Boolean dailyChest;

    /** 经验加成% */
    private Integer expBoost;

    /** 兑换折扣 0.90=九折 */
    private BigDecimal redeemDiscount;

    /** 头像框标识 */
    private String avatarFrame;

    /** 愿望直达降价% */
    private Integer wishDiscount;
}
