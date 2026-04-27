package com.family.hub.module.store.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.result.PageResult;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.store.dto.RedeemOrderCreateDTO;
import com.family.hub.module.store.entity.RedeemOrderEntity;
import com.family.hub.module.store.entity.RewardEntity;
import com.family.hub.module.store.mapper.RedeemOrderMapper;
import com.family.hub.module.store.mapper.RewardMapper;
import com.family.hub.module.store.vo.RedeemOrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedeemOrderService {

    private final RedeemOrderMapper redeemOrderMapper;
    private final RewardMapper rewardMapper;
    private final UserService userService;
    private final PointLogService pointLogService;

    @Transactional
    public RedeemOrderVO create(RedeemOrderCreateDTO dto) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();

        RewardEntity reward = rewardMapper.selectById(dto.getRewardId());
        if (reward == null) {
            throw new BizException(ResultCode.NOT_FOUND, "奖励商品不存在");
        }
        if (!reward.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权兑换该奖励商品");
        }
        if (!"ON".equals(reward.getStatus())) {
            throw new BizException(ResultCode.BAD_REQUEST, "奖励商品已下架");
        }
        if (reward.getStock() != -1 && reward.getStock() <= 0) {
            throw new BizException(ResultCode.REWARD_OUT_OF_STOCK, "奖励库存不足");
        }

        int rows = userService.subtractPoints(userId, reward.getPointsPrice());
        if (rows == 0) {
            throw new BizException(ResultCode.POINT_INSUFFICIENT, "积分不足");
        }

        RedeemOrderEntity order = new RedeemOrderEntity();
        order.setFamilyId(familyId);
        order.setUserId(userId);
        order.setRewardId(reward.getId());
        order.setPointsCost(reward.getPointsPrice());
        order.setStatus("PENDING");
        redeemOrderMapper.insert(order);

        pointLogService.record(familyId, userId, "FREEZE", -reward.getPointsPrice(), order.getId(),
                "兑换「" + reward.getName() + "」冻结积分");

        if (reward.getStock() != -1) {
            reward.setStock(reward.getStock() - 1);
            int rewardRows = rewardMapper.updateById(reward);
            if (rewardRows == 0) {
                throw new BizException(ResultCode.REWARD_OUT_OF_STOCK, "库存变化，请重试");
            }
        }

        return toVO(order, reward.getName());
    }

    @Transactional
    public void approve(Long orderId) {
        checkAdminPermission();
        RedeemOrderEntity order = getOrderWithCheck(orderId);

        if (!"PENDING".equals(order.getStatus())) {
            throw new BizException(ResultCode.BAD_REQUEST, "订单状态不正确，无法审批");
        }

        order.setStatus("APPROVED");
        int rows = redeemOrderMapper.updateById(order);
        if (rows == 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "订单已被其他操作修改，请重试");
        }

        pointLogService.record(order.getFamilyId(), order.getUserId(), "REDEEM", -order.getPointsCost(),
                order.getId(), "兑换审批通过");
    }

    @Transactional
    public void reject(Long orderId) {
        checkAdminPermission();
        RedeemOrderEntity order = getOrderWithCheck(orderId);

        if (!"PENDING".equals(order.getStatus())) {
            throw new BizException(ResultCode.BAD_REQUEST, "订单状态不正确，无法拒绝");
        }

        order.setStatus("REJECTED");
        redeemOrderMapper.updateById(order);

        userService.addPoints(order.getUserId(), order.getPointsCost());
        pointLogService.record(order.getFamilyId(), order.getUserId(), "UNFREEZE", order.getPointsCost(),
                order.getId(), "兑换被拒绝，积分解冻退还");

        RewardEntity reward = rewardMapper.selectById(order.getRewardId());
        if (reward != null && reward.getStock() != -1) {
            reward.setStock(reward.getStock() + 1);
            rewardMapper.updateById(reward);
        }
    }

    public List<RedeemOrderVO> list(Long userId, String status) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<RedeemOrderEntity>()
                .eq(RedeemOrderEntity::getFamilyId, familyId);
        if (userId != null) {
            wrapper.eq(RedeemOrderEntity::getUserId, userId);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(RedeemOrderEntity::getStatus, status);
        }
        wrapper.orderByDesc(RedeemOrderEntity::getCreatedAt);
        return redeemOrderMapper.selectList(wrapper).stream()
                .map(order -> {
                    RewardEntity reward = rewardMapper.selectById(order.getRewardId());
                    String rewardName = reward != null ? reward.getName() : "未知商品";
                    return toVO(order, rewardName);
                }).toList();
    }

    public PageResult<RedeemOrderVO> listPaged(Long userId, String status, int page, int pageSize) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<RedeemOrderEntity>()
                .eq(RedeemOrderEntity::getFamilyId, familyId);
        if (userId != null) {
            wrapper.eq(RedeemOrderEntity::getUserId, userId);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(RedeemOrderEntity::getStatus, status);
        }
        wrapper.orderByDesc(RedeemOrderEntity::getCreatedAt);

        Page<RedeemOrderEntity> pageParam = new Page<>(page, pageSize);
        Page<RedeemOrderEntity> result = redeemOrderMapper.selectPage(pageParam, wrapper);

        var list = result.getRecords().stream()
                .map(order -> {
                    RewardEntity reward = rewardMapper.selectById(order.getRewardId());
                    String rewardName = reward != null ? reward.getName() : "未知商品";
                    return toVO(order, rewardName);
                }).toList();

        return new PageResult<>(list, result.getTotal(), page, pageSize);
    }

    private RedeemOrderEntity getOrderWithCheck(Long orderId) {
        RedeemOrderEntity order = redeemOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException(ResultCode.NOT_FOUND, "兑换订单不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!order.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该订单");
        }
        return order;
    }

    private void checkAdminPermission() {
        String role = SecurityUtils.getCurrentUser().getRole();
        var allowed = Arrays.asList("ADMIN", "PARENT");
        if (!allowed.contains(role)) {
            throw new BizException(ResultCode.FORBIDDEN, "只有家长可以审批兑换订单");
        }
    }

    private RedeemOrderVO toVO(RedeemOrderEntity order, String rewardName) {
        return RedeemOrderVO.builder()
                .id(order.getId())
                .familyId(order.getFamilyId())
                .userId(order.getUserId())
                .rewardId(order.getRewardId())
                .rewardName(rewardName)
                .pointsCost(order.getPointsCost())
                .status(order.getStatus())
                .remark(order.getRemark())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
