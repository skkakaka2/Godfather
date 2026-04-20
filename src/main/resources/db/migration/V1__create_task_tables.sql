-- ============================================================
-- Family Hub — 模块 B：任务打卡 表结构
-- 版本：1.0.0
-- 日期：2026-04-16
-- ============================================================

-- -----------------------------------------------------------
-- 1. task_template（任务模板）
-- 家长创建的可复用任务模板，定义任务的"是什么"和"什么时候适用"
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_template (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    name            VARCHAR(64)     NOT NULL COMMENT '模板名称，如"语文作业"',
    category        VARCHAR(16)     NOT NULL COMMENT '分类：STUDY/SPORT/CHORE/HOBBY/OTHER',
    icon            VARCHAR(32)     NULL     COMMENT '图标标识',
    default_points  INT             NOT NULL DEFAULT 0 COMMENT '默认积分数',
    applicable_sun  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '周日是否适用',
    applicable_mon  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周一是否适用',
    applicable_tue  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周二是否适用',
    applicable_wed  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周三是否适用',
    applicable_thu  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周四是否适用',
    applicable_fri  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '周五是否适用',
    applicable_sat  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '周六是否适用',
    deadline_time   TIME            NULL     COMMENT '默认截止时间，如 21:00:00',
    sort_order      INT             NOT NULL DEFAULT 0 COMMENT '排序',
    enabled         TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '是否启用',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_family_enabled (family_id, enabled)
) COMMENT '任务模板';


-- -----------------------------------------------------------
-- 2. daily_task（每日任务）
-- 每天根据模板自动生成 + 家长手动添加的临时任务
-- 一条记录 = 一个孩子的一天的一项任务
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_task (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    user_id         BIGINT          NOT NULL COMMENT '分配给哪个孩子',
    template_id     BIGINT          NULL     COMMENT '关联模板ID，临时任务为NULL',
    task_date       DATE            NOT NULL COMMENT '任务日期',
    name            VARCHAR(64)     NOT NULL COMMENT '任务名称（冗余快照）',
    category        VARCHAR(16)     NOT NULL COMMENT '分类：STUDY/SPORT/CHORE/HOBBY/OTHER',
    icon            VARCHAR(32)     NULL     COMMENT '图标',
    points          INT             NOT NULL DEFAULT 0 COMMENT '完成可得积分',
    deadline_time   TIME            NULL     COMMENT '截止时间（可覆盖模板默认值）',
    sort_order      INT             NOT NULL DEFAULT 0 COMMENT '排序',
    status          VARCHAR(16)     NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING/COMPLETED/CONFIRMED/REJECTED/SETTLED',
    is_temp         TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否临时任务',
    reminded        TINYINT(1)      DEFAULT 0 COMMENT '是否已发送超时提醒',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_user_date (user_id, task_date),
    INDEX idx_family_date (family_id, task_date),
    INDEX idx_template (template_id)
) COMMENT '每日任务';


-- -----------------------------------------------------------
-- 3. task_checkin（打卡/确认记录）
-- 每次打卡、确认、打回的操作记录
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_checkin (
    id              BIGINT PRIMARY KEY,
    daily_task_id   BIGINT          NOT NULL COMMENT '关联每日任务',
    user_id         BIGINT          NOT NULL COMMENT '操作人（打卡=孩子，确认/打回=家长）',
    action          VARCHAR(16)     NOT NULL COMMENT '操作类型：CHECKIN/CONFIRM/REJECT',
    photo_url       VARCHAR(512)    NULL     COMMENT '照片凭证URL',
    remark          VARCHAR(500)    NULL     COMMENT '备注',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    INDEX idx_task (daily_task_id)
) COMMENT '打卡/确认记录';
