-- ============================================================
-- Family Hub — 认证模块 表结构
-- 版本：1.0.0
-- 日期：2026-04-20
-- ============================================================

-- -----------------------------------------------------------
-- 1. family（家庭）
-- 每个注册家庭对应一条记录，生成唯一邀请码供成员加入
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
-- 家长和孩子共用一张表，通过 role 区分角色
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
    id              BIGINT PRIMARY KEY,
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    username        VARCHAR(32)     NOT NULL COMMENT '用户名',
    password        VARCHAR(128)    NOT NULL COMMENT '密码（BCrypt）',
    nickname        VARCHAR(32)     NULL     COMMENT '昵称',
    avatar          VARCHAR(512)    NULL     COMMENT '头像URL',
    role            VARCHAR(16)     NOT NULL COMMENT '角色：ADMIN/MEMBER/GUEST',
    gender          TINYINT(1)      NULL     COMMENT '性别：0-女 1-男',
    birth_date      DATE            NULL     COMMENT '出生日期',
    status          TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    last_login_at   DATETIME        NULL     COMMENT '最后登录时间',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT(1)      DEFAULT 0,

    UNIQUE INDEX uk_family_username (family_id, username),
    INDEX idx_family_status (family_id, status)
) COMMENT '用户';
