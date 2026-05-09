package com.family.hub.module.auth.api;

/**
 * 用户模块门面接口，供其他模块调用。
 * 其他模块应只依赖此接口，不直接依赖 auth 内部的 Service/Mapper/Entity。
 */
public interface UserFacade {

    /**
     * 查询用户积分余额
     */
    int getPoints(Long userId);

    /**
     * 查询用户内啡肽余额
     */
    int getEndorphins(Long userId);

    /**
     * 判断用户是否为管理员或家长
     */
    boolean isAdminOrParent(Long userId);

    /**
     * 增加积分，返回影响行数
     */
    int addPoints(Long userId, Integer points);

    /**
     * 扣减积分（余额不足时不扣），返回影响行数（0=余额不足）
     */
    int subtractPoints(Long userId, Integer points);

    /**
     * 增加内啡肽，返回影响行数
     */
    int addEndorphins(Long userId, Integer amount);

    /**
     * 扣减内啡肽（余额不足时不扣），返回影响行数（0=余额不足）
     */
    int subtractEndorphins(Long userId, Integer amount);
}
