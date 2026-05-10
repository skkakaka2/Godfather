-- ============================================================
-- 更新 user 表角色定义
-- 版本：1.0.0
-- 日期：2026-04-22
-- ============================================================
-- 更新 role 字段注释：ADMIN-管理员 / PARENT-前额叶 / CHILD-神经元
ALTER TABLE user
MODIFY COLUMN role VARCHAR(16) NOT NULL COMMENT '角色：ADMIN-管理员 / PARENT-前额叶 / CHILD-神经元';
ALTER TABLE task_checkin drop COLUMN photo_url;
ALTER TABLE task_checkin
add COLUMN photo_urls LONGTEXT NOT NULL COMMENT '照片凭证URL';
ALTER TABLE task_checkin
add COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE task_checkin
add COLUMN family_id BIGINT NOT NULL COMMENT '所属家庭ID';