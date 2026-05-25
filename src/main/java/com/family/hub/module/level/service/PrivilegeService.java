package com.family.hub.module.level.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.level.entity.LevelConfigEntity;
import com.family.hub.module.level.entity.PrivilegeUsageEntity;
import com.family.hub.module.level.mapper.PrivilegeUsageMapper;
import com.family.hub.module.level.vo.ChestResultVO;
import com.family.hub.module.store.service.PointLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrivilegeService {

    private static final int CHEST_MIN = 5;
    private static final int CHEST_MAX = 20;
    private static final int EXP_MIN=1;
    private static final int EXP_MAX=15;

    private final PrivilegeUsageMapper privilegeUsageMapper;
    private final ExperienceService experienceService;
    private final UserMapper userMapper;
    private final PointLogService pointLogService;

    /**
     * 使用翻倍卡（Lv.5+）
     * 标记当天为翻倍日，confirm 时检查此状态
     */
    @Transactional
    public void useDoubleCard() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();

        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        if (config.getDoubleCard() == null || config.getDoubleCard() <= 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "当前等级未解锁翻倍卡");
        }

        String periodKey = getCurrentWeekKey();
        boolean used = hasUsedPrivilege(userId, "DOUBLE_CARD", periodKey);
        if (used) {
            throw new BizException(ResultCode.BAD_REQUEST, "本周已使用翻倍卡");
        }

        recordUsage(familyId, userId, "DOUBLE_CARD", periodKey, null, "翻倍卡");
    }

    /**
     * 检查今天是否处于翻倍卡状态
     */
    public boolean isDoubleCardActive(Long familyId, Long userId) {
        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        if (config.getDoubleCard() == null || config.getDoubleCard() <= 0) {
            return false;
        }
        return hasUsedPrivilege(userId, "DOUBLE_CARD", getCurrentWeekKey());
    }

    /**
     * 尝试使用连击护盾（Lv.4+），streak 断签时自动调用
     * @return true=护盾生效，false=无护盾可用
     */
    @Transactional
    public boolean tryUseStreakShield(Long familyId, Long userId) {
        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        if (config.getStreakShield() == null || config.getStreakShield() <= 0) {
            return false;
        }

        String periodKey = getCurrentMonthKey();
        long usedCount = countUsage(userId, "STREAK_SHIELD", periodKey);
        if (usedCount >= config.getStreakShield()) {
            return false;
        }

        recordUsage(familyId, userId, "STREAK_SHIELD", periodKey, null, "连击护盾");
        return true;
    }

    /**
     * 开宝箱（Lv.6+），随机 3~20 血清素
     */
    @Transactional
    public ChestResultVO openDailyChest() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();

        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        if (config.getDailyChest() == null || !config.getDailyChest()) {
            throw new BizException(ResultCode.BAD_REQUEST, "当前等级未解锁幸运宝箱");
        }

        String periodKey = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        boolean used = hasUsedPrivilege(userId, "DAILY_CHEST", periodKey);
        if (used) {
            throw new BizException(ResultCode.BAD_REQUEST, "今天已开过宝箱");
        }

        int points = ThreadLocalRandom.current().nextInt(CHEST_MIN, CHEST_MAX + 1);

        int exp = ThreadLocalRandom.current().nextInt(EXP_MIN, EXP_MAX + 1);

        userMapper.addPoints(userId, points);

        pointLogService.record(familyId, userId, "CHEST", points, null, "幸运宝箱 +" + points);

        experienceService.addExperience(familyId, userId, exp, "CHEST", null, "幸运宝箱");

        recordUsage(familyId, userId, "DAILY_CHEST", periodKey, null, "开出 " + points + " 血清素");

        return ChestResultVO.builder()
                .points(points)
                .exp(exp)
                .build();
    }

    /**
     * 愿望直达（Lv.10），指定商品降价30%
     */
    @Transactional
    public void useWishDirect(Long rewardId) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();

        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        if (config.getWishDiscount() == null || config.getWishDiscount() <= 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "当前等级未解锁愿望直达");
        }

        String periodKey = getCurrentMonthKey();
        boolean used = hasUsedPrivilege(userId, "WISH_DIRECT", periodKey);
        if (used) {
            throw new BizException(ResultCode.BAD_REQUEST, "本月已使用愿望直达");
        }

        recordUsage(familyId, userId, "WISH_DIRECT", periodKey, rewardId,
                "愿望直达降价" + config.getWishDiscount() + "%");
    }

    // ========== 内部方法 ==========

    private boolean hasUsedPrivilege(Long userId, String type, String periodKey) {
        return privilegeUsageMapper.selectCount(
                new LambdaQueryWrapper<PrivilegeUsageEntity>()
                        .eq(PrivilegeUsageEntity::getUserId, userId)
                        .eq(PrivilegeUsageEntity::getPrivilegeType, type)
                        .eq(PrivilegeUsageEntity::getPeriodKey, periodKey)) > 0;
    }

    private long countUsage(Long userId, String type, String periodKey) {
        return privilegeUsageMapper.selectCount(
                new LambdaQueryWrapper<PrivilegeUsageEntity>()
                        .eq(PrivilegeUsageEntity::getUserId, userId)
                        .eq(PrivilegeUsageEntity::getPrivilegeType, type)
                        .eq(PrivilegeUsageEntity::getPeriodKey, periodKey));
    }

    private void recordUsage(Long familyId, Long userId, String type, String periodKey,
                             Long refId, String result) {
        PrivilegeUsageEntity usage = new PrivilegeUsageEntity();
        usage.setFamilyId(familyId);
        usage.setUserId(userId);
        usage.setPrivilegeType(type);
        usage.setPeriodKey(periodKey);
        usage.setRefId(refId);
        usage.setRewardResult(result);
        privilegeUsageMapper.insert(usage);
    }

    private String getCurrentWeekKey() {
        LocalDate now = LocalDate.now();
        return String.format("%dW%02d", now.getYear(),
                now.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear()));
    }

    private String getCurrentMonthKey() {
        return YearMonth.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
    }
}
