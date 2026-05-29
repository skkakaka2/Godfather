-- 活动管理模块
-- 基表 + 3张类型子表 + redeem_order 扩展

-- 活动基表
CREATE TABLE activity (
    id              BIGINT          NOT NULL COMMENT '雪花ID',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭',
    name            VARCHAR(100)    NOT NULL COMMENT '活动名称',
    description     VARCHAR(500)    NULL     COMMENT '活动描述',
    banner_image    VARCHAR(500)    NULL     COMMENT 'Banner图片URL',
    type            VARCHAR(20)     NOT NULL COMMENT 'DISCOUNT/SPECIAL_REWARD/BONUS',
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT/ACTIVE/EXPIRED',
    start_time      DATETIME        NOT NULL COMMENT '开始时间',
    end_time        DATETIME        NOT NULL COMMENT '结束时间',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT             NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_family_status (family_id, status),
    KEY idx_time (start_time, end_time)
) COMMENT='节日活动';

-- 打折配置
CREATE TABLE activity_discount (
    id              BIGINT       NOT NULL,
    activity_id     BIGINT       NOT NULL COMMENT '关联活动ID',
    discount_rate   DECIMAL(3,2) NOT NULL COMMENT '折扣率，0.80=八折',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_activity (activity_id)
) COMMENT='活动-打折配置';

-- 限时特惠奖励
CREATE TABLE activity_special_reward (
    id                   BIGINT       NOT NULL,
    activity_id          BIGINT       NOT NULL COMMENT '关联活动ID',
    reward_name          VARCHAR(100) NOT NULL COMMENT '特惠奖励名称',
    reward_image         VARCHAR(500) NULL     COMMENT '奖励图片',
    reward_points_price  INT          NOT NULL COMMENT '血清素价格',
    reward_description   VARCHAR(500) NULL     COMMENT '奖励描述',
    reward_stock         INT          NULL     COMMENT '库存，NULL=无限',
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted              INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_activity (activity_id)
) COMMENT='活动-限时特惠奖励';

-- 积分/经验加成
CREATE TABLE activity_bonus (
    id               BIGINT       NOT NULL,
    activity_id      BIGINT       NOT NULL COMMENT '关联活动ID',
    bonus_type       VARCHAR(20)  NOT NULL COMMENT 'POINTS/EXPERIENCE',
    bonus_multiplier DECIMAL(4,2) NOT NULL COMMENT '倍数，2.00=双倍',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_activity (activity_id)
) COMMENT='活动-加成配置';

-- redeem_order 新增 activity_id 字段，用于特惠奖励来源标记
ALTER TABLE redeem_order ADD COLUMN activity_id BIGINT NULL COMMENT '关联活动ID，特惠奖励兑换时使用' AFTER reward_id;
