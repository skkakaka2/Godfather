package com.family.hub.module.activity.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.activity.dto.ActivityCreateDTO;
import com.family.hub.module.activity.dto.ActivityUpdateDTO;
import com.family.hub.module.activity.entity.*;
import com.family.hub.module.activity.mapper.*;
import com.family.hub.module.activity.vo.ActivityVO;
import com.family.hub.module.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityMapper activityMapper;
    private final ActivityDiscountMapper discountMapper;
    private final ActivitySpecialRewardMapper specialRewardMapper;
    private final ActivityBonusMapper bonusMapper;
    private final UserService userService;

    /** 活动类型常量 */
    public static final String TYPE_DISCOUNT = "DISCOUNT";
    public static final String TYPE_SPECIAL_REWARD = "SPECIAL_REWARD";
    public static final String TYPE_BONUS = "BONUS";

    /** 状态常量 */
    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_EXPIRED = "EXPIRED";

    // ==================== CRUD ====================

    public List<ActivityVO> list(String type, String status) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<ActivityEntity>()
                .eq(ActivityEntity::getFamilyId, familyId);
        if (type != null && !type.isBlank()) {
            wrapper.eq(ActivityEntity::getType, type);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(ActivityEntity::getStatus, status);
        }
        wrapper.orderByDesc(ActivityEntity::getCreatedAt);
        return activityMapper.selectList(wrapper).stream()
                .map(this::toVOWithComputedStatus)
                .toList();
    }

    public ActivityVO getById(Long id) {
        ActivityEntity entity = activityMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "活动不存在");
        }
        checkFamilyAccess(entity);
        return toVOWithComputedStatus(entity);
    }

    @Transactional
    public ActivityVO create(ActivityCreateDTO dto) {
        checkAdminPermission();
        validateTypeFields(dto.getType(), dto);
        if (dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new BizException(ResultCode.BAD_REQUEST, "结束时间不能早于开始时间");
        }

        Long familyId = SecurityUtils.getCurrentFamilyId();

        ActivityEntity entity = new ActivityEntity();
        entity.setFamilyId(familyId);
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setBannerImage(dto.getBannerImage());
        entity.setType(dto.getType());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setStatus(STATUS_DRAFT);
        activityMapper.insert(entity);

        saveTypeConfig(entity.getId(), dto);

        return toVO(entity);
    }

    @Transactional
    public ActivityVO update(Long id, ActivityUpdateDTO dto) {
        checkAdminPermission();
        ActivityEntity entity = activityMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "活动不存在");
        }
        checkFamilyAccess(entity);

        if (dto.getName() != null)
            entity.setName(dto.getName());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getBannerImage() != null)
            entity.setBannerImage(dto.getBannerImage());
        if (dto.getStartTime() != null)
            entity.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null)
            entity.setEndTime(dto.getEndTime());

        if (entity.getEndTime().isBefore(entity.getStartTime())) {
            throw new BizException(ResultCode.BAD_REQUEST, "结束时间不能早于开始时间");
        }

        activityMapper.updateById(entity);
        updateTypeConfig(entity.getId(), entity.getType(), dto);

        return toVO(entity);
    }

    public void delete(Long id) {
        checkAdminPermission();
        ActivityEntity entity = activityMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "活动不存在");
        }
        checkFamilyAccess(entity);
        activityMapper.deleteById(id);
    }

    public void toggleStatus(Long id) {
        checkAdminPermission();
        ActivityEntity entity = activityMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "活动不存在");
        }
        checkFamilyAccess(entity);

        // 简单切换：DRAFT <-> ACTIVE
        if (STATUS_DRAFT.equals(entity.getStatus())) {
            entity.setStatus(STATUS_ACTIVE);
        } else if (STATUS_ACTIVE.equals(entity.getStatus())) {
            entity.setStatus(STATUS_DRAFT);
        } else {
            throw new BizException(ResultCode.BAD_REQUEST, "已过期的活动不能切换状态");
        }
        activityMapper.updateById(entity);
    }

    // ==================== 移动端查询 ====================

    /** 获取当前家庭进行中的活动列表 */
    public List<ActivityVO> getActiveActivities() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        LocalDateTime now = LocalDateTime.now();

        var wrapper = new LambdaQueryWrapper<ActivityEntity>()
                .eq(ActivityEntity::getFamilyId, familyId)
                .eq(ActivityEntity::getStatus, STATUS_ACTIVE)
                .le(ActivityEntity::getStartTime, now)
                .ge(ActivityEntity::getEndTime, now);

        return activityMapper.selectList(wrapper).stream()
                .map(this::toVO)
                .toList();
    }

    // ==================== 业务集成查询 ====================

    /** 获取当前家庭有效的打折活动折扣率，无则返回 null */
    public BigDecimal getActiveDiscountRate(Long familyId) {
        LocalDateTime now = LocalDateTime.now();
        var wrapper = new LambdaQueryWrapper<ActivityEntity>()
                .eq(ActivityEntity::getFamilyId, familyId)
                .eq(ActivityEntity::getType, TYPE_DISCOUNT)
                .eq(ActivityEntity::getStatus, STATUS_ACTIVE)
                .le(ActivityEntity::getStartTime, now)
                .ge(ActivityEntity::getEndTime, now)
                .last("LIMIT 1");
        ActivityEntity activity = activityMapper.selectOne(wrapper);
        if (activity == null)
            return null;

        var discountWrapper = new LambdaQueryWrapper<ActivityDiscountEntity>()
                .eq(ActivityDiscountEntity::getActivityId, activity.getId())
                .last("LIMIT 1");
        ActivityDiscountEntity discount = discountMapper.selectOne(discountWrapper);
        return discount != null ? discount.getDiscountRate() : null;
    }

    /** 获取当前家庭有效的加成活动，无则返回 null */
    public ActivityBonusEntity getActiveBonus(Long familyId, String bonusType) {
        LocalDateTime now = LocalDateTime.now();
        var wrapper = new LambdaQueryWrapper<ActivityEntity>()
                .eq(ActivityEntity::getFamilyId, familyId)
                .eq(ActivityEntity::getType, TYPE_BONUS)
                .eq(ActivityEntity::getStatus, STATUS_ACTIVE)
                .le(ActivityEntity::getStartTime, now)
                .ge(ActivityEntity::getEndTime, now)
                .last("LIMIT 1");
        ActivityEntity activity = activityMapper.selectOne(wrapper);
        if (activity == null)
            return null;

        var bonusWrapper = new LambdaQueryWrapper<ActivityBonusEntity>()
                .eq(ActivityBonusEntity::getActivityId, activity.getId())
                .eq(ActivityBonusEntity::getBonusType, bonusType)
                .last("LIMIT 1");
        return bonusMapper.selectOne(bonusWrapper);
    }

    /** 获取特惠奖励详情 */
    public ActivitySpecialRewardEntity getSpecialReward(Long activityId) {
        var wrapper = new LambdaQueryWrapper<ActivitySpecialRewardEntity>()
                .eq(ActivitySpecialRewardEntity::getActivityId, activityId)
                .last("LIMIT 1");
        return specialRewardMapper.selectOne(wrapper);
    }

    /** 扣减特惠奖励库存，返回是否成功 */
    public boolean deductSpecialRewardStock(Long activityId) {
        ActivitySpecialRewardEntity reward = getSpecialReward(activityId);
        if (reward == null)
            return false;
        if (reward.getRewardStock() == null)
            return true; // 无限库存
        if (reward.getRewardStock() <= 0)
            return false;

        reward.setRewardStock(reward.getRewardStock() - 1);
        specialRewardMapper.updateById(reward);
        return true;
    }

    /** 归还特惠奖励库存 */
    public void restoreSpecialRewardStock(Long activityId) {
        ActivitySpecialRewardEntity reward = getSpecialReward(activityId);
        if (reward == null || reward.getRewardStock() == null)
            return;
        reward.setRewardStock(reward.getRewardStock() + 1);
        specialRewardMapper.updateById(reward);
    }

    // ==================== 私有方法 ====================

    private void validateTypeFields(String type, ActivityCreateDTO dto) {
        switch (type) {
            case TYPE_DISCOUNT -> {
                if (dto.getDiscountRate() == null) {
                    throw new BizException(ResultCode.BAD_REQUEST, "打折活动必须设置折扣率");
                }
                if (dto.getDiscountRate().compareTo(BigDecimal.ZERO) <= 0
                        || dto.getDiscountRate().compareTo(BigDecimal.ONE) > 0) {
                    throw new BizException(ResultCode.BAD_REQUEST, "折扣率必须在 0.01~1.00 之间");
                }
            }
            case TYPE_SPECIAL_REWARD -> {
                if (dto.getRewardName() == null || dto.getRewardName().isBlank()) {
                    throw new BizException(ResultCode.BAD_REQUEST, "特惠奖励名称不能为空");
                }
                if (dto.getRewardPointsPrice() == null || dto.getRewardPointsPrice() <= 0) {
                    throw new BizException(ResultCode.BAD_REQUEST, "特惠奖励价格必须大于0");
                }
            }
            case TYPE_BONUS -> {
                if (dto.getBonusType() == null || dto.getBonusType().isBlank()) {
                    throw new BizException(ResultCode.BAD_REQUEST, "加成类型不能为空");
                }
                if (dto.getBonusMultiplier() == null || dto.getBonusMultiplier().compareTo(BigDecimal.ONE) <= 0) {
                    throw new BizException(ResultCode.BAD_REQUEST, "加成倍数必须大于1");
                }
            }
            default -> throw new BizException(ResultCode.BAD_REQUEST, "不支持的活动类型: " + type);
        }
    }

    private void saveTypeConfig(Long activityId, ActivityCreateDTO dto) {
        switch (dto.getType()) {
            case TYPE_DISCOUNT -> {
                ActivityDiscountEntity e = new ActivityDiscountEntity();
                e.setActivityId(activityId);
                e.setDiscountRate(dto.getDiscountRate());
                discountMapper.insert(e);
            }
            case TYPE_SPECIAL_REWARD -> {
                ActivitySpecialRewardEntity e = new ActivitySpecialRewardEntity();
                e.setActivityId(activityId);
                e.setRewardName(dto.getRewardName());
                e.setRewardImage(dto.getRewardImage());
                e.setRewardPointsPrice(dto.getRewardPointsPrice());
                e.setRewardDescription(dto.getRewardDescription());
                e.setRewardStock(dto.getRewardStock());
                specialRewardMapper.insert(e);
            }
            case TYPE_BONUS -> {
                ActivityBonusEntity e = new ActivityBonusEntity();
                e.setActivityId(activityId);
                e.setBonusType(dto.getBonusType());
                e.setBonusMultiplier(dto.getBonusMultiplier());
                bonusMapper.insert(e);
            }
        }
    }

    private void updateTypeConfig(Long activityId, String type, ActivityUpdateDTO dto) {
        switch (type) {
            case TYPE_DISCOUNT -> {
                if (dto.getDiscountRate() != null) {
                    var wrapper = new LambdaQueryWrapper<ActivityDiscountEntity>()
                            .eq(ActivityDiscountEntity::getActivityId, activityId);
                    ActivityDiscountEntity e = discountMapper.selectOne(wrapper);
                    if (e != null) {
                        e.setDiscountRate(dto.getDiscountRate());
                        discountMapper.updateById(e);
                    }
                }
            }
            case TYPE_SPECIAL_REWARD -> {
                var wrapper = new LambdaQueryWrapper<ActivitySpecialRewardEntity>()
                        .eq(ActivitySpecialRewardEntity::getActivityId, activityId);
                ActivitySpecialRewardEntity e = specialRewardMapper.selectOne(wrapper);
                if (e != null) {
                    if (dto.getRewardName() != null)
                        e.setRewardName(dto.getRewardName());
                    if (dto.getRewardImage() != null)
                        e.setRewardImage(dto.getRewardImage());
                    if (dto.getRewardPointsPrice() != null)
                        e.setRewardPointsPrice(dto.getRewardPointsPrice());
                    if (dto.getRewardDescription() != null)
                        e.setRewardDescription(dto.getRewardDescription());
                    if (dto.getRewardStock() != null)
                        e.setRewardStock(dto.getRewardStock());
                    specialRewardMapper.updateById(e);
                }
            }
            case TYPE_BONUS -> {
                var wrapper = new LambdaQueryWrapper<ActivityBonusEntity>()
                        .eq(ActivityBonusEntity::getActivityId, activityId);
                ActivityBonusEntity e = bonusMapper.selectOne(wrapper);
                if (e != null) {
                    if (dto.getBonusType() != null)
                        e.setBonusType(dto.getBonusType());
                    if (dto.getBonusMultiplier() != null)
                        e.setBonusMultiplier(dto.getBonusMultiplier());
                    bonusMapper.updateById(e);
                }
            }
        }
    }

    private void checkAdminPermission() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userService.isAdmin(userId) || userService.isParent(userId)) {
            return;
        }
        throw new BizException(ResultCode.FORBIDDEN, "只有家长可以管理活动");
    }

    private void checkFamilyAccess(ActivityEntity entity) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!entity.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该活动");
        }
    }

    private ActivityVO toVO(ActivityEntity e) {
        return buildVO(e, computeStatus(e));
    }

    private ActivityVO toVOWithComputedStatus(ActivityEntity e) {
        return buildVO(e, computeStatus(e));
    }

    private String computeStatus(ActivityEntity e) {
        if (!STATUS_ACTIVE.equals(e.getStatus()))
            return e.getStatus();
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(e.getStartTime())) {
            log.info("活动未到开始时间: {}", e.getName());
            return STATUS_DRAFT;
        }
        if (now.isAfter(e.getEndTime())) {
            log.info("活动已结束: {}", e.getName());
            return STATUS_EXPIRED;
        }
        return STATUS_ACTIVE;
    }

    private ActivityVO buildVO(ActivityEntity e, String status) {
        var builder = ActivityVO.builder()
                .id(e.getId())
                .familyId(e.getFamilyId())
                .name(e.getName())
                .description(e.getDescription())
                .bannerImage(e.getBannerImage())
                .type(e.getType())
                .status(status)
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt());

        // 填充类型子表数据
        switch (e.getType()) {
            case TYPE_DISCOUNT -> {
                var w = new LambdaQueryWrapper<ActivityDiscountEntity>()
                        .eq(ActivityDiscountEntity::getActivityId, e.getId());
                ActivityDiscountEntity d = discountMapper.selectOne(w);
                if (d != null)
                    builder.discountRate(d.getDiscountRate());
            }
            case TYPE_SPECIAL_REWARD -> {
                var w = new LambdaQueryWrapper<ActivitySpecialRewardEntity>()
                        .eq(ActivitySpecialRewardEntity::getActivityId, e.getId());
                ActivitySpecialRewardEntity r = specialRewardMapper.selectOne(w);
                if (r != null) {
                    builder.rewardName(r.getRewardName())
                            .rewardImage(r.getRewardImage())
                            .rewardPointsPrice(r.getRewardPointsPrice())
                            .rewardDescription(r.getRewardDescription())
                            .rewardStock(r.getRewardStock());
                }
            }
            case TYPE_BONUS -> {
                var w = new LambdaQueryWrapper<ActivityBonusEntity>()
                        .eq(ActivityBonusEntity::getActivityId, e.getId());
                ActivityBonusEntity b = bonusMapper.selectOne(w);
                if (b != null) {
                    builder.bonusType(b.getBonusType())
                            .bonusMultiplier(b.getBonusMultiplier());
                }
            }
        }

        return builder.build();
    }
}
