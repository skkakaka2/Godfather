ALTER TABLE user
ADD COLUMN endorphins INT NOT NULL DEFAULT 0 COMMENT '内啡肽';

CREATE TABLE endorphin_log (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    type            VARCHAR(30)     NOT NULL COMMENT '类型：EARN-赚取、EXCHANGE-兑换',
    amount          INT             NOT NULL COMMENT '变动内啡肽数（正数为增加，负数为减少）',
    balance_after   INT             NOT NULL COMMENT '操作后余额',
    ref_id          BIGINT          NULL COMMENT '关联业务ID（突触ID等）',
    remark          VARCHAR(500)    NULL COMMENT '说明',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    INDEX idx_endorphin_log_user_id (user_id),
    INDEX idx_endorphin_log_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内啡肽流水';

CREATE TABLE task_streak_reward (
    id                    BIGINT      NOT NULL COMMENT '主键',
    family_id             BIGINT      NOT NULL COMMENT '所属家庭ID',
    user_id               BIGINT      NOT NULL COMMENT '用户ID',
    template_id           BIGINT      NOT NULL COMMENT '突触模板ID',
    daily_task_id         BIGINT      NOT NULL COMMENT '触发奖励的每日突触ID',
    streak_days           INT         NOT NULL COMMENT '连续确认突触日数量',
    endorphins_awarded    INT         NOT NULL COMMENT '奖励内啡肽数量',
    created_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted               INT         NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_streak_reward (daily_task_id, streak_days),
    INDEX idx_task_streak_user_template (family_id, user_id, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='突触连续激活奖励记录';
