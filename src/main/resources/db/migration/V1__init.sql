-- ============================================================
-- Family Hub — 全量建表脚本
-- 整合 V1~V12 所有迁移，直接反映当前最终表结构
-- ============================================================

-- -----------------------------------------------------------
-- 1. family（家庭）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS family (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(64)     NOT NULL COMMENT '家庭名称',
    invite_code     VARCHAR(16)     NOT NULL COMMENT '邀请码',
    status          TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '状态：1-正常',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    UNIQUE INDEX uk_invite_code (invite_code)
) COMMENT '家庭';


-- -----------------------------------------------------------
-- 2. user（用户）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    username        VARCHAR(32)     NOT NULL COMMENT '用户名',
    password        VARCHAR(128)    NOT NULL COMMENT '密码（BCrypt）',
    nickname        VARCHAR(32)     NULL     COMMENT '昵称',
    avatar          VARCHAR(512)    NULL     COMMENT '头像URL',
    role            VARCHAR(16)     NOT NULL COMMENT '角色：ADMIN-管理员 / PARENT-前额叶 / CHILD-神经元',
    gender          TINYINT(1)      NULL     COMMENT '性别：0-女 1-男',
    birth_date      DATE            NULL     COMMENT '出生日期',
    points          INT             NOT NULL DEFAULT 0 COMMENT '血清素',
    endorphins      INT             NOT NULL DEFAULT 0 COMMENT '内啡肽',
    status          TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    last_login_at   DATETIME        NULL     COMMENT '最后登录时间',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    UNIQUE INDEX uk_family_username (family_id, username),
    INDEX idx_family_status (family_id, status)
) COMMENT '用户';


-- -----------------------------------------------------------
-- 3. task_template（突触模板）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_template (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    name            VARCHAR(64)     NOT NULL COMMENT '模板名称',
    category        VARCHAR(16)     NOT NULL COMMENT '分类：STUDY/SPORT/CHORE/HOBBY/TALENT/OTHER',
    icon            VARCHAR(32)     NULL     COMMENT '图标标识',
    default_points  INT             NOT NULL DEFAULT 0 COMMENT '默认血清素数',
    applicable_sun  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '周日是否适用',
    applicable_mon  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周一是否适用',
    applicable_tue  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周二是否适用',
    applicable_wed  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周三是否适用',
    applicable_thu  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周四是否适用',
    applicable_fri  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周五是否适用',
    applicable_sat  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '周六是否适用',
    deadline_time   TIME            NULL     COMMENT '默认截止时间',
    sort_order      INT             NOT NULL DEFAULT 0 COMMENT '排序',
    enabled         TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_family_enabled (family_id, enabled)
) COMMENT '突触模板';


-- -----------------------------------------------------------
-- 4. daily_task（每日突触）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_task (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '分配给哪个神经元',
    template_id     BIGINT          NULL     COMMENT '关联模板ID，临时任务为NULL',
    task_date       DATE            NOT NULL COMMENT '任务日期',
    name            VARCHAR(64)     NOT NULL COMMENT '任务名称（冗余快照）',
    category        VARCHAR(16)     NOT NULL COMMENT '分类：STUDY/SPORT/CHORE/HOBBY/TALENT/OTHER',
    icon            VARCHAR(32)     NULL     COMMENT '图标',
    points          INT             NOT NULL DEFAULT 0 COMMENT '完成可得血清素',
    deadline_time   TIME            NULL     COMMENT '截止时间',
    sort_order      INT             NOT NULL DEFAULT 0 COMMENT '排序',
    status          VARCHAR(16)     NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/COMPLETED/CONFIRMED/REJECTED/SETTLED',
    is_temp         TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否临时任务',
    reminded        TINYINT(1)      DEFAULT 0 COMMENT '是否已发送超时提醒',
    version         INT             DEFAULT 0 COMMENT '乐观锁版本号',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_user_date (user_id, task_date),
    INDEX idx_family_date (family_id, task_date),
    INDEX idx_template (template_id)
) COMMENT '每日突触';


-- -----------------------------------------------------------
-- 5. task_checkin（激活/确认记录）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_checkin (
    id              BIGINT PRIMARY KEY,
    daily_task_id   BIGINT          NOT NULL COMMENT '关联每日任务',
    user_id         BIGINT          NOT NULL COMMENT '操作人',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    action          VARCHAR(16)     NOT NULL COMMENT '操作类型：CHECKIN/CONFIRM/REJECT',
    photo_urls      LONGTEXT        NOT NULL COMMENT '照片凭证URL',
    remark          VARCHAR(500)    NULL     COMMENT '备注',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_task (daily_task_id)
) COMMENT '激活/确认记录';


-- -----------------------------------------------------------
-- 6. reward（多巴胺商品）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reward (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    name            VARCHAR(100)    NOT NULL COMMENT '多巴胺名称',
    description     VARCHAR(500)    NULL COMMENT '多巴胺描述',
    points_price    INT             NOT NULL COMMENT '激发所需血清素',
    image_url       VARCHAR(500)    NULL COMMENT '封面图URL',
    stock           INT             NOT NULL DEFAULT -1 COMMENT '库存数量，-1表示不限量',
    status          VARCHAR(10)     NOT NULL DEFAULT 'ON' COMMENT '状态：ON-上架、OFF-下架',
    version         INT             NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    INDEX idx_reward_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多巴胺商品';


-- -----------------------------------------------------------
-- 7. redeem_order（激发订单）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS redeem_order (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    user_id         BIGINT          NOT NULL COMMENT '激发人ID',
    reward_id       BIGINT          NOT NULL COMMENT '多巴胺商品ID',
    points_cost     INT             NOT NULL COMMENT '消耗血清素',
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING-待审批、APPROVED-已通过、REJECTED-已拒绝',
    remark          VARCHAR(500)    NULL COMMENT '备注',
    version         INT             NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    INDEX idx_redeem_family_id (family_id),
    INDEX idx_redeem_user_id (user_id),
    INDEX idx_redeem_reward_id (reward_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激发订单';


-- -----------------------------------------------------------
-- 8. point_log（血清素流水）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS point_log (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    type            VARCHAR(20)     NOT NULL COMMENT '类型：EARN/REDEEM/MANUAL_ADD/MANUAL_SUB/FREEZE/UNFREEZE',
    amount          INT             NOT NULL COMMENT '变动血清素数',
    balance_after   INT             NOT NULL COMMENT '操作后余额',
    ref_id          BIGINT          NULL COMMENT '关联业务ID',
    remark          VARCHAR(500)    NULL COMMENT '说明',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (id),
    INDEX idx_point_log_user_id (user_id),
    INDEX idx_point_log_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血清素流水';


-- -----------------------------------------------------------
-- 9. endorphin_log（内啡肽流水）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS endorphin_log (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    type            VARCHAR(30)     NOT NULL COMMENT '类型：EARN/EXCHANGE',
    amount          INT             NOT NULL COMMENT '变动内啡肽数',
    balance_after   INT             NOT NULL COMMENT '操作后余额',
    ref_id          BIGINT          NULL COMMENT '关联业务ID',
    remark          VARCHAR(500)    NULL COMMENT '说明',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (id),
    INDEX idx_endorphin_log_user_id (user_id),
    INDEX idx_endorphin_log_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内啡肽流水';


-- -----------------------------------------------------------
-- 10. task_streak_reward（突触连续激活奖励记录）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_streak_reward (
    id                    BIGINT      NOT NULL COMMENT '主键',
    family_id             BIGINT      NOT NULL COMMENT '所属家庭ID',
    user_id               BIGINT      NOT NULL COMMENT '用户ID',
    template_id           BIGINT      NOT NULL COMMENT '突触模板ID',
    daily_task_id         BIGINT      NOT NULL COMMENT '触发奖励的每日突触ID',
    streak_days           INT         NOT NULL COMMENT '连续确认突触日数量',
    endorphins_awarded    INT         NOT NULL COMMENT '奖励内啡肽数量',
    created_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted               INT         NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_streak_reward (daily_task_id, streak_days),
    INDEX idx_task_streak_user_template (family_id, user_id, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='突触连续激活奖励记录';


-- -----------------------------------------------------------
-- 11. level_config（等级配置，family_id=0 为默认模板）
-- exp_required 已按 V12 难度（×1.5）写入
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS level_config (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    level           INT             NOT NULL COMMENT '大等级 1-10',
    sub_level       INT             NOT NULL COMMENT '小阶段 1-低等 2-中等 3-高等',
    title           VARCHAR(32)     NOT NULL COMMENT '完整称号',
    exp_required    INT             NOT NULL COMMENT '达到该阶段所需累计经验',
    sub_reward      INT             NOT NULL DEFAULT 0 COMMENT '升入该小阶段奖励血清素',
    bonus_percent   INT             NOT NULL DEFAULT 0 COMMENT '血清素加成%',
    daily_sign_bonus INT            NOT NULL DEFAULT 0 COMMENT '每日签到额外血清素',
    streak_shield   INT             NOT NULL DEFAULT 0 COMMENT '每月连击护盾次数',
    double_card     INT             NOT NULL DEFAULT 0 COMMENT '每周翻倍卡张数',
    daily_chest     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '每日宝箱',
    exp_boost       INT             NOT NULL DEFAULT 0 COMMENT '经验加成%',
    redeem_discount DECIMAL(3,2)    NOT NULL DEFAULT 1.00 COMMENT '兑换折扣',
    avatar_frame    VARCHAR(64)     NULL COMMENT '头像框标识',
    wish_discount   INT             NOT NULL DEFAULT 0 COMMENT '愿望直达降价%',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_family_level_sub (family_id, level, sub_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='等级配置';


-- -----------------------------------------------------------
-- 12. user_level（用户等级）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_level (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    total_level     INT             NOT NULL DEFAULT 1 COMMENT '总等级 1-30',
    level           INT             NOT NULL DEFAULT 1 COMMENT '当前大等级 1-10',
    sub_level       INT             NOT NULL DEFAULT 1 COMMENT '当前小阶段 1-3',
    exp             INT             NOT NULL DEFAULT 0 COMMENT '累计经验',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user (user_id),
    INDEX idx_family (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户等级';


-- -----------------------------------------------------------
-- 13. experience_log（经验流水）
-- -----------------------------------------------------------
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
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_user (user_id),
    INDEX idx_family (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='经验流水';


-- -----------------------------------------------------------
-- 14. privilege_usage（特权使用记录）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS privilege_usage (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    privilege_type  VARCHAR(32)     NOT NULL COMMENT '特权类型：DOUBLE_CARD/STREAK_SHIELD/DAILY_CHEST/WISH_DIRECT',
    period_key      VARCHAR(16)     NOT NULL COMMENT '周期：2026W18/2026M04/20260430',
    ref_id          BIGINT          NULL COMMENT '关联业务ID',
    reward_result   VARCHAR(255)    NULL COMMENT '结果',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_type_period (user_id, privilege_type, period_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='特权使用记录';


-- ============================================================
-- 种子数据：level_config（family_id=0 为默认模板）
-- exp_required 已按 V12 难度（×1.5 取整到5的倍数）
-- ============================================================

-- Lv.1 自律新手 — 无特权
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward) VALUES
(1,  0, 1, 1, '低等自律新手', 0,    0),
(2,  0, 1, 2, '中等自律新手', 55,   5),
(3,  0, 1, 3, '高等自律新手', 105,  10);

-- Lv.2 自律学徒 — 解锁：血清素+5%
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent) VALUES
(4,  0, 2, 1, '低等自律学徒', 150,  0,  5),
(5,  0, 2, 2, '中等自律学徒', 255,  5,  5),
(6,  0, 2, 3, '高等自律学徒', 360,  10, 5);

-- Lv.3 自律行者 — 解锁：每日签到+5血清素
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus) VALUES
(7,  0, 3, 1, '低等自律行者', 450,  0,  5, 5),
(8,  0, 3, 2, '中等自律行者', 600,  5,  5, 5),
(9,  0, 3, 3, '高等自律行者', 750,  10, 5, 5);

-- Lv.4 自律达人 — 解锁：连击护盾（月1次）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield) VALUES
(10, 0, 4, 1, '低等自律达人', 900,  0,  5, 5, 1),
(11, 0, 4, 2, '中等自律达人', 1095, 5,  5, 5, 1),
(12, 0, 4, 3, '高等自律达人', 1305, 10, 5, 5, 1);

-- Lv.5 自律精英 — 解锁：翻倍卡（周1张）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card) VALUES
(13, 0, 5, 1, '低等自律精英', 1500, 0,  5, 5, 1, 1),
(14, 0, 5, 2, '中等自律精英', 1755, 5,  5, 5, 1, 1),
(15, 0, 5, 3, '高等自律精英', 1995, 10, 5, 5, 1, 1);

-- Lv.6 自律强者 — 解锁：幸运宝箱（日1次）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest) VALUES
(16, 0, 6, 1, '低等自律强者', 2250, 0,  5, 5, 1, 1, 1),
(17, 0, 6, 2, '中等自律强者', 2595, 5,  5, 5, 1, 1, 1),
(18, 0, 6, 3, '高等自律强者', 2955, 10, 5, 5, 1, 1, 1);

-- Lv.7 自律大师 — 解锁：经验加速+25%
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost) VALUES
(19, 0, 7, 1, '低等自律大师', 3300, 0,  5, 5, 1, 1, 1, 25),
(20, 0, 7, 2, '中等自律大师', 3705, 5,  5, 5, 1, 1, 1, 25),
(21, 0, 7, 3, '高等自律大师', 4095, 10, 5, 5, 1, 1, 1, 25);

-- Lv.8 自律王者 — 解锁：兑换9折
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount) VALUES
(22, 0, 8, 1, '低等自律王者', 4500, 0,  5, 5, 1, 1, 1, 25, 0.90),
(23, 0, 8, 2, '中等自律王者', 4995, 5,  5, 5, 1, 1, 1, 25, 0.90),
(24, 0, 8, 3, '高等自律王者', 5505, 10, 5, 5, 1, 1, 1, 25, 0.90);

-- Lv.9 自律传奇 — 解锁：专属外观
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount, avatar_frame) VALUES
(25, 0, 9, 1, '低等自律传奇', 6000, 0,  5, 5, 1, 1, 1, 25, 0.90, 'diamond'),
(26, 0, 9, 2, '中等自律传奇', 6750, 5,  5, 5, 1, 1, 1, 25, 0.90, 'diamond'),
(27, 0, 9, 3, '高等自律传奇', 7500, 10, 5, 5, 1, 1, 1, 25, 0.90, 'diamond');

-- Lv.10 自律至尊 — 解锁：愿望直达（月降30%）
INSERT INTO level_config (id, family_id, level, sub_level, title, exp_required, sub_reward, bonus_percent, daily_sign_bonus, streak_shield, double_card, daily_chest, exp_boost, redeem_discount, avatar_frame, wish_discount) VALUES
(28, 0, 10, 1, '低等自律至尊', 8250,  0,  5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30),
(29, 0, 10, 2, '中等自律至尊', 10500, 5,  5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30),
(30, 0, 10, 3, '高等自律至尊', 12750, 10, 5, 5, 1, 1, 1, 25, 0.90, 'diamond', 30);
