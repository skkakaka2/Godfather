package com.family.hub.module.level.api;

/**
 * 等级模块门面接口，供其他模块调用。
 * 其他模块应只依赖此接口，不直接依赖 level 内部的 Service/Entity。
 */
public interface LevelFacade {

    /**
     * 获取用户当前等级配置
     */
    LevelConfigDTO getCurrentConfig(Long familyId, Long userId);

    /**
     * 判断用户当天是否处于翻倍卡激活状态
     */
    boolean isDoubleCardActive(Long familyId, Long userId);

    /**
     * 增加经验值（含自动升级逻辑）
     *
     * @param familyId 家庭ID
     * @param userId   用户ID
     * @param amount   经验数量
     * @param source   来源标识（如 TASK_CONFIRM、TASK_STREAK、CHEST）
     * @param refId    关联业务ID
     * @param remark   备注
     */
    void addExperience(Long familyId, Long userId, int amount, String source, Long refId, String remark);
}
