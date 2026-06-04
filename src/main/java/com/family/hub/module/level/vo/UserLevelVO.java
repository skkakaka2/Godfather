package com.family.hub.module.level.vo;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class UserLevelVO {

    private Long userId;

    /** 总等级 1-30 */
    private Integer totalLevel;

    /** 当前大等级 1-10 */
    private Integer level;

    /** 当前小阶段 */
    private Integer subLevel;

    /** 称号 */
    private String title;

    /** 当前累计经验 */
    private Integer exp;

    /** 升到下一阶段所需经验 */
    private Integer nextExpRequired;

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

    /** 兑换折扣 */
    private BigDecimal redeemDiscount;

    /** 头像框 */
    private String avatarFrame;

    /** 愿望直达降价% */
    private Integer wishDiscount;
}
