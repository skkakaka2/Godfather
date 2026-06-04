package com.family.hub.module.store.vo;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EndorphinLogVO {

    /** 流水ID */
    private Long id;

    /** 所属家庭ID */
    private Long familyId;

    /** 用户ID */
    private Long userId;

    /** 类型：EARN/EXCHANGE */
    private String type;

    /** 变动内啡肽数（正数增加，负数减少） */
    private Integer amount;

    /** 操作后余额 */
    private Integer balanceAfter;

    /** 关联业务ID */
    private Long refId;

    /** 说明 */
    private String remark;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
