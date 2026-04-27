CREATE TABLE reward (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    name            VARCHAR(100)    NOT NULL COMMENT '多巴胺名称',
    description     VARCHAR(500)    NULL COMMENT '多巴胺描述',
    points_price    INT             NOT NULL COMMENT '激发所需血清素',
    image_url       VARCHAR(500)    NULL COMMENT '封面图URL',
    stock           INT             NOT NULL DEFAULT -1 COMMENT '库存数量，-1表示不限量',
    status          VARCHAR(10)     NOT NULL DEFAULT 'ON' COMMENT '状态：ON-上架、OFF-下架',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    INDEX idx_reward_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多巴胺商品';

CREATE TABLE redeem_order (
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

CREATE TABLE point_log (
    id              BIGINT          NOT NULL COMMENT '主键',
    family_id       BIGINT          NOT NULL COMMENT '所属家庭ID',
    user_id         BIGINT          NOT NULL COMMENT '用户ID',
    type            VARCHAR(20)     NOT NULL COMMENT '类型：EARN-赚取、REDEEM-激发、MANUAL_ADD-手动增加、MANUAL_SUB-手动扣减、FREEZE-冻结、UNFREEZE-解冻退还',
    amount          INT             NOT NULL COMMENT '变动血清素数（正数为增加，负数为减少）',
    balance_after   INT             NOT NULL COMMENT '操作后余额',
    ref_id          BIGINT          NULL COMMENT '关联业务ID（突触ID/订单ID等）',
    remark          VARCHAR(500)    NULL COMMENT '说明',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted         INT             NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    PRIMARY KEY (id),
    INDEX idx_point_log_user_id (user_id),
    INDEX idx_point_log_family_id (family_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血清素流水';
