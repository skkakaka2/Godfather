-- 添加乐观锁版本号字段
ALTER TABLE daily_task ADD COLUMN version INT DEFAULT 0 COMMENT '乐观锁版本号';