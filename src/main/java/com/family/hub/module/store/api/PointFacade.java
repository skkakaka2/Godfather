package com.family.hub.module.store.api;

/**
 * 积分模块门面接口，供其他模块调用。
 * 其他模块应只依赖此接口，不直接依赖 store 内部的 Service/Mapper/Entity。
 */
public interface PointFacade {

    /**
     * 记录积分流水
     *
     * @param familyId 家庭ID
     * @param userId   用户ID
     * @param type     流水类型（EARN/REDEEM/BONUS/DOUBLE_CARD/ENDORPHIN_EXCHANGE/LEVEL_UP/CHEST/DAILY_SIGN 等）
     * @param amount   变动金额（正数增加，负数扣减）
     * @param refId    关联业务ID
     * @param remark   备注
     */
    void record(Long familyId, Long userId, String type, int amount, Long refId, String remark);
}
