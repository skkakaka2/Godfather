package com.family.hub.module.store.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.result.PageResult;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.activity.entity.ActivitySpecialRewardEntity;
import com.family.hub.module.activity.service.ActivityService;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.store.dto.RedeemOrderCreateDTO;
import com.family.hub.module.store.entity.RedeemOrderEntity;
import com.family.hub.module.store.entity.RewardEntity;
import com.family.hub.module.store.mapper.RedeemOrderMapper;
import com.family.hub.module.store.mapper.RewardMapper;
import com.family.hub.module.store.vo.RedeemOrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
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
    private final ActivityService activityService;

    @Value("${vacation.winter.start.month:01}")
    private String winterStartMonth;
    @Value("${vacation.winter.start.day:20}")
    private String winterStartDay;
    @Value("${vacation.winter.end.month:02}")
    private String winterEndMonth;
    @Value("${vacation.winter.end.day:09}")
    private String winterEndDay;
    @Value("${vacation.summer.start.month:07}")
    private String summerStartMonth;
    @Value("${vacation.summer.start.day:01}")
    private String summerStartDay;
    @Value("${vacation.summer.end.month:08}")
    private String summerEndMonth;
    @Value("${vacation.summer.end.day:31}")
    private String summerEndDay;

    @Transactional
    public RedeemOrderVO create(RedeemOrderCreateDTO dto) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();

        if (dto.getActivityId() == null && dto.getRewardId() == null) {
            throw new BizException(ResultCode.BAD_REQUEST, "请选择要兑换的奖励");
        }

        int todayOfWeek = LocalDate.now().getDayOfWeek().getValue();
        if (!isVacation() && (todayOfWeek != 6 && todayOfWeek != 7)) {
            throw new BizException(ResultCode.BAD_REQUEST, "非寒暑假期间仅支持周末兑换哦，周内请好好学习吧!");
        }

        // 特惠奖励兑换
        if (dto.getActivityId() != null) {
            return redeemSpecialReward(familyId, userId, dto.getActivityId());
        }

        // 普通奖励兑换
        return redeemNormalReward(familyId, userId, dto.getRewardId());
    }

    /** 普通奖励兑换 */
    private RedeemOrderVO redeemNormalReward(Long familyId, Long userId, Long rewardId) {
        RewardEntity reward = rewardMapper.selectById(rewardId);

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

        BigDecimal discountRate = activityService.getActiveDiscountRate(familyId);
        int actualCost = discountRate != null
                ? (int) Math.ceil(reward.getPointsPrice() * discountRate.doubleValue())
                : reward.getPointsPrice();

        int rows = userService.subtractPoints(userId, actualCost);
        if (rows == 0) {
            throw new BizException(ResultCode.POINT_INSUFFICIENT, "积分不足");
        }

        RedeemOrderEntity order = new RedeemOrderEntity();
        order.setFamilyId(familyId);
        order.setUserId(userId);
        order.setRewardId(reward.getId());
        order.setPointsCost(actualCost);
        order.setStatus("PENDING");
        redeemOrderMapper.insert(order);

        String freezeRemark = discountRate != null
                ? "兑换「" + reward.getName() + "」冻结积分（" + (discountRate.doubleValue() * 10) + "折）"
                : "兑换「" + reward.getName() + "」冻结积分";
        pointLogService.record(familyId, userId, "FREEZE", -actualCost, order.getId(), freezeRemark);

        if (reward.getStock() != -1) {
            reward.setStock(reward.getStock() - 1);
            int rewardRows = rewardMapper.updateById(reward);
            if (rewardRows == 0) {
                throw new BizException(ResultCode.REWARD_OUT_OF_STOCK, "库存变化，请重试");
            }
        }

        return toVO(order, reward.getName());
    }

    /** 特惠奖励兑换 */
    private RedeemOrderVO redeemSpecialReward(Long familyId, Long userId, Long activityId) {
        ActivitySpecialRewardEntity specialReward = activityService.getSpecialReward(activityId);
        if (specialReward == null) {
            throw new BizException(ResultCode.NOT_FOUND, "特惠奖励不存在");
        }
        if (specialReward.getRewardStock() != null && specialReward.getRewardStock() <= 0) {
            throw new BizException(ResultCode.REWARD_OUT_OF_STOCK, "特惠奖励库存不足");
        }

        int cost = specialReward.getRewardPointsPrice();
        int rows = userService.subtractPoints(userId, cost);
        if (rows == 0) {
            throw new BizException(ResultCode.POINT_INSUFFICIENT, "积分不足");
        }

        RedeemOrderEntity order = new RedeemOrderEntity();
        order.setFamilyId(familyId);
        order.setUserId(userId);
        order.setRewardId(null);
        order.setActivityId(activityId);
        order.setPointsCost(cost);
        order.setStatus("PENDING");
        redeemOrderMapper.insert(order);

        pointLogService.record(familyId, userId, "FREEZE", -cost, order.getId(),
                "兑换特惠「" + specialReward.getRewardName() + "」冻结积分");

        activityService.deductSpecialRewardStock(activityId);

        return toVO(order, specialReward.getRewardName());
    }

    private boolean isVacation() {
        LocalDate now = LocalDate.now();

        LocalDate winterStart = LocalDate.of(now.getYear(), Month.of(Integer.parseInt(winterStartMonth)),
                Integer.parseInt(winterStartDay));
        LocalDate winterEnd = LocalDate.of(now.getYear(), Month.of(Integer.parseInt(winterEndMonth)),
                Integer.parseInt(winterEndDay));
        LocalDate summerStart = LocalDate.of(now.getYear(), Month.of(Integer.parseInt(summerStartMonth)),
                Integer.parseInt(summerStartDay));
        LocalDate summerEnd = LocalDate.of(now.getYear(), Month.of(Integer.parseInt(summerEndMonth)),
                Integer.parseInt(summerEndDay));

        // 判断是否在寒暑假期间
        boolean inThisYearWinter = !now.isBefore(winterStart) && !now.isAfter(winterEnd);
        boolean inSummer = !now.isBefore(summerStart) && !now.isAfter(summerEnd);

        return inThisYearWinter || inSummer;
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

        // 特惠奖励：归还库存
        if (order.getActivityId() != null) {
            activityService.restoreSpecialRewardStock(order.getActivityId());
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
                .map(order -> toVO(order, resolveRewardName(order)))
                .toList();
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
                .map(order -> toVO(order, resolveRewardName(order)))
                .toList();

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
                .activityId(order.getActivityId())
                .rewardName(rewardName)
                .pointsCost(order.getPointsCost())
                .status(order.getStatus())
                .remark(order.getRemark())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private String resolveRewardName(RedeemOrderEntity order) {
        // 特惠奖励：从活动获取名称
        if (order.getActivityId() != null) {
            ActivitySpecialRewardEntity special = activityService.getSpecialReward(order.getActivityId());
            return special != null ? special.getRewardName() : "特惠奖励";
        }
        // 普通奖励
        RewardEntity reward = rewardMapper.selectById(order.getRewardId());
        return reward != null ? reward.getName() : "未知商品";
    }
}
