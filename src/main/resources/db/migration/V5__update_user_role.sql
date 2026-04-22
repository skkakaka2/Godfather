-- ============================================================
-- 更新 user 表角色定义
-- 版本：1.0.0
-- 日期：2026-04-22
-- ============================================================

-- 更新 role 字段注释：ADMIN-管理员 / PARENT-家长 / CHILD-孩子
ALTER TABLE user MODIFY COLUMN role VARCHAR(16) NOT NULL COMMENT '角色：ADMIN-管理员 / PARENT-家长 / CHILD-孩子';
