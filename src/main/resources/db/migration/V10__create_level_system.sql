-- ============================================================
-- 等级系统：髓鞘化等级（10大等级 × 3小阶段 = 30阶段）
-- ============================================================

-- 等级配置表
CREATE TABLE IF NOT EXISTS level_config (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    level           INT             NOT NULL COMMENT '大等级 1-10',
    sub_level       INT             NOT NULL COMMENT '小阶段 1-低等 2-中等 3-高等',
    title           VARCHAR(32)     NOT NULL COMMENT '完整称号，如"低等裸突触""高等薄髓鞘"',
    exp_required    INT             NOT NULL COMMENT '达到该阶段所需累计经验',
    sub_reward      INT             NOT NULL DEFAULT 0 COMMENT '升入该小阶段奖励血清素',
    -- 特权字段（同一大等级内三个小阶段共享）
    bonus_percent   INT             NOT NULL DEFAULT 0 COMMENT '血清素加成%',
    daily_sign_bonus INT            NOT NULL DEFAULT 0 COMMENT '每日签到额外血清素',
    streak_shield   INT             NOT NULL DEFAULT 0 COMMENT '每月连击护盾次数',
    double_card     INT             NOT NULL DEFAULT 0 COMMENT '每周翻倍卡张数',
    daily_chest     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '每日宝箱',
    exp_boost       INT             NOT NULL DEFAULT 0 COMMENT '经验加成%',
    redeem_discount DECIMAL(3,2)    NOT NULL DEFAULT 1.00 COMMENT '兑换折扣 0.90=九折',
    avatar_frame    VARCHAR(64)     NULL COMMENT '头像框标识',
    wish_discount   INT             NOT NULL DEFAULT 0 COMMENT '愿望直达降价%',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_family_level_sub (family_id, level, sub_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='等级配置';

-- 用户等级
CREATE TABLE IF NOT EXISTS user_level (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    total_level     INT             NOT NULL DEFAULT 1 COMMENT '总等级 1-30',
    level           INT             NOT NULL DEFAULT 1 COMMENT '当前大等级 1-10',
    sub_level       INT             NOT NULL DEFAULT 1 COMMENT '当前小阶段 1-低等 2-中等 3-高等',
    exp             INT             NOT NULL DEFAULT 0 COMMENT '累计经验',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user (user_id),
    INDEX idx_family (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户等级';

-- 经验流水
CREATE TABLE IF NOT EXISTS experience_log (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    amount          INT             NOT NULL COMMENT '变动经验',
    exp_after       INT             NOT NULL COMMENT '变动后累计经验',
    source          VARCHAR(20)     NOT NULL COMMENT '来源：TASK_CONFIRM/TASK_STREAK/DAILY_SIGN/CHEST/SUB_LEVEL_UP/MANUAL',
    ref_id          BIGINT          NULL COMMENT '关联业务ID',
    remark          VARCHAR(500)    NULL COMMENT '说明',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_user (user_id),
    INDEX idx_family (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='经验流水';

-- 特权使用记录
CREATE TABLE IF NOT EXISTS privilege_usage (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    privilege_type  VARCHAR(32)     NOT NULL COMMENT '特权类型：DOUBLE_CARD/STREAK_SHIELD/DAILY_CHEST/WISH_DIRECT',
    period_key      VARCHAR(16)     NOT NULL COMMENT '周期：2026W18/2026M04/20260430',
    ref_id          BIGINT          NULL COMMENT '关联业务ID',
    reward_result   VARCHAR(255)    NULL COMMENT '结果（宝箱开出数/护盾保护天数等）',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_type_period (user_id, privilege_type, period_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='特权使用记录';

-- ============================================================
-- 默认种子数据（family_id=0 为默认模板，创建家庭时复制一份）
-- ============================================================

-- Lv.1 自律新手 — 无特权
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward) VALUES
(1,  0, 1, 1, '低等自律新手', 0,    0),
(2,  0, 1, 2, '中等自律新手', 35,   5),
(3,  0, 1, 3, '高等自律新手', 70,   10);

-- Lv.2 自律学徒 — 解锁：血清素+5%
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent) VALUES
(4,  0, 2, 1, '低等自律学徒', 100,  0,  5),
(5,  0, 2, 2, '中等自律学徒', 170,  5,  5),
(6,  0, 2, 3, '高等自律学徒', 240,  10, 5);

-- Lv.3 自律行者 — 解锁：每日签到+5血清素
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus) VALUES
(7,  0, 3, 1, '低等自律行者', 300,  0,  5, 5),
(8,  0, 3, 2, '中等自律行者', 400,  5,  5, 5),
(9,  0, 3, 3, '高等自律行者', 500,  10, 5, 5);

-- Lv.4 自律达人 — 解锁：连击护盾（月1次）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield) VALUES
(10, 0, 4, 1, '低等自律达人', 600,  0,  5, 5, 1),
(11, 0, 4, 2, '中等自律达人', 730,  5,  5, 5, 1),
(12, 0, 4, 3, '高等自律达人', 870,  10, 5, 5, 1);

-- Lv.5 自律精英 — 解锁：翻倍卡（周1张）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card) VALUES
(13, 0, 5, 1, '低等自律精英', 1000, 0,  5, 5, 1, 1),
(14, 0, 5, 2, '中等自律精英', 1170, 5,  5, 5, 1, 1),
(15, 0, 5, 3, '高等自律精英', 1330, 10, 5, 5, 1, 1);

-- Lv.6 自律强者 — 解锁：幸运宝箱（日1次）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest) VALUES
(16, 0, 6, 1, '低等自律强者', 1500, 0,  5, 5, 1, 1, 1),
(17, 0, 6, 2, '中等自律强者', 1730, 5,  5, 5, 1, 1, 1),
(18, 0, 6, 3, '高等自律强者', 1970, 10, 5, 5, 1, 1, 1);

-- Lv.7 自律大师 — 解锁：经验加速+25%
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost) VALUES
(19, 0, 7, 1, '低等自律大师', 2200, 0,  5, 5, 1, 1, 1, 25),
(20, 0, 7, 2, '中等自律大师', 2470, 5,  5, 5, 1, 1, 1, 25),
(21, 0, 7, 3, '高等自律大师', 2730, 10, 5, 5, 1, 1, 1, 25);

-- Lv.8 自律王者 — 解锁：兑换9折
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount) VALUES
(22, 0, 8, 1, '低等自律王者', 3000, 0,  5, 5, 1, 1, 1, 25, 0.90),
(23, 0, 8, 2, '中等自律王者', 3330, 5,  5, 5, 1, 1, 1, 25, 0.90),
(24, 0, 8, 3, '高等自律王者', 3670, 10, 5, 5, 1, 1, 1, 25, 0.90);

-- Lv.9 自律传奇 — 解锁：专属外观
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount, avatar_frame) VALUES
(25, 0, 9, 1, '低等自律传奇', 4000, 0,  5, 5, 1, 1, 1, 25, 0.90, 'diamond'),
(26, 0, 9, 2, '中等自律传奇', 4500, 5,  5, 5, 1, 1, 1, 25, 0.90, 'diamond'),
(27, 0, 9, 3, '高等自律传奇', 5000, 10, 5, 5, 1, 1, 1, 25, 0.90, 'diamond');

-- Lv.10 自律至尊 — 解锁：愿望直达（月降30%）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount, avatar_frame, wish_discount) VALUES
(28, 0, 10, 1, '低等自律至尊', 5500, 0,  5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30),
(29, 0, 10, 2, '中等自律至尊', 7000, 5,  5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30),
(30, 0, 10, 3, '高等自律至尊', 8500, 10, 5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30);
