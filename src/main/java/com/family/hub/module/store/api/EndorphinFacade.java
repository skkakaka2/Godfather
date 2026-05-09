package com.family.hub.module.store.api;

/**
 * 内啡肽模块门面接口，供其他模块调用。
 * 其他模块应只依赖此接口，不直接依赖 store 内部的 EndorphinService。
 */
public interface EndorphinFacade {

    /**
     * 增加内啡肽
     *
     * @param familyId 家庭ID
     * @param userId   用户ID
     * @param amount   增加数量（必须 > 0）
     * @param refId    关联业务ID
     * @param remark   备注
     */
    void addEndorphins(Long familyId, Long userId, int amount, Long refId, String remark);
}
