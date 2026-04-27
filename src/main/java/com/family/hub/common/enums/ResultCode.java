package com.family.hub.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ResultCode {

    SUCCESS(200, "success"),
    BAD_REQUEST(400, "参数校验失败"),
    UNAUTHORIZED(401, "未登录"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "资源冲突"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    POINT_INSUFFICIENT(1001, "积分不足"),
    REWARD_OUT_OF_STOCK(1002, "奖励库存不足"),
    ENDORPHIN_INSUFFICIENT(1003, "内啡肽不足"),

    PAPER_NOT_FOUND(2001, "试卷不存在"),
    ANSWER_TIMEOUT(2002, "答题超时"),

    TASK_EXPIRED(3001, "任务已过期");

    private final int code;
    private final String message;
}
