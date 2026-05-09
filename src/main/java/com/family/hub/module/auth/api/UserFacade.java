package com.family.hub.module.auth.api;

import java.util.List;

/**
 * 用户模块门面接口，供其他模块调用。
 * 其他模块应只依赖此接口，不直接依赖 auth 内部的 Service/Mapper/Entity。
 */
public interface UserFacade {

    /**
     * 查询用户所属家庭ID
     */
    Long getFamilyId(Long userId);

    /**
     * 判断用户是否存在且属于指定家庭
     */
    boolean existsInFamily(Long userId, Long familyId);

    /**
     * 查询所有活跃的孩子用户（用于每日任务生成）
     */
    List<UserBriefInfo> getAllActiveChildren();

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
