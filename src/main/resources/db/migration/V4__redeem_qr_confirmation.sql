-- redeem_order 二维码确认兑换字段
ALTER TABLE redeem_order
    ADD COLUMN redeem_code VARCHAR(64) NULL COMMENT '二维码兑换随机码' AFTER status,
    ADD COLUMN confirmed_by BIGINT NULL COMMENT '扫码确认人ID' AFTER redeem_code,
    ADD COLUMN confirmed_at DATETIME NULL COMMENT '扫码确认时间' AFTER confirmed_by,
    ADD COLUMN canceled_at DATETIME NULL COMMENT '取消时间' AFTER confirmed_at;

CREATE UNIQUE INDEX uk_redeem_order_redeem_code ON redeem_order (redeem_code);
CREATE INDEX idx_redeem_order_scan ON redeem_order (family_id, redeem_code, status);
