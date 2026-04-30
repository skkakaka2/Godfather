package com.family.hub.module.level.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.level.entity.ExperienceLogEntity;
import com.family.hub.module.level.entity.LevelConfigEntity;
import com.family.hub.module.level.entity.UserLevelEntity;
import com.family.hub.module.level.mapper.ExperienceLogMapper;
import com.family.hub.module.level.mapper.LevelConfigMapper;
import com.family.hub.module.level.mapper.UserLevelMapper;
import com.family.hub.module.level.vo.UserLevelVO;
import com.family.hub.module.store.service.PointLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExperienceService {

    private static final int DAILY_SIGN_EXP = 10;

    private final UserLevelMapper userLevelMapper;
    private final LevelConfigMapper levelConfigMapper;
    private final ExperienceLogMapper experienceLogMapper;
    private final UserMapper userMapper;
    private final PointLogService pointLogService;

    /**
     * 加经验 + 自动升级
     */
    @Transactional
    public void addExperience(Long familyId, Long userId, int amount, String source, Long refId, String remark) {
        if (amount <= 0) {
            return;
        }

        UserLevelEntity userLevel = getOrCreateUserLevel(familyId, userId);

        // 获取当前等级配置的 exp_boost 加成
        LevelConfigEntity currentConfig = getConfig(familyId, userLevel.getLevel(), userLevel.getSubLevel());
        int boostPercent = (currentConfig != null && currentConfig.getExpBoost() != null)
                ? currentConfig.getExpBoost() : 0;
        int actualAmount = amount + amount * boostPercent / 100;

        int newExp = userLevel.getExp() + actualAmount;
        userLevel.setExp(newExp);

        // 查找新经验对应的最高阶段
        LevelConfigEntity newConfig = findConfigByExp(familyId, newExp);
        if (newConfig != null) {
            int newTotalLevel = (newConfig.getLevel() - 1) * 3 + newConfig.getSubLevel();

            boolean levelChanged = !newConfig.getLevel().equals(userLevel.getLevel())
                    || !newConfig.getSubLevel().equals(userLevel.getSubLevel());

            userLevel.setLevel(newConfig.getLevel());
            userLevel.setSubLevel(newConfig.getSubLevel());
            userLevel.setTotalLevel(newTotalLevel);

            // 小阶段提升奖励血清素
            if (levelChanged && newConfig.getSubReward() != null && newConfig.getSubReward() > 0) {
                userMapper.addPoints(userId, newConfig.getSubReward());
                pointLogService.record(familyId, userId, "LEVEL_UP", newConfig.getSubReward(), null,
                        "升级至 " + newConfig.getTitle() + " 奖励");
            }
        }

        userLevelMapper.updateById(userLevel);

        // 插入经验流水
        ExperienceLogEntity expLog = new ExperienceLogEntity();
        expLog.setFamilyId(familyId);
        expLog.setUserId(userId);
        expLog.setAmount(actualAmount);
        expLog.setExpAfter(newExp);
        expLog.setSource(source);
        expLog.setRefId(refId);
        expLog.setRemark(remark);
        experienceLogMapper.insert(expLog);
    }

    /**
     * 查询当前等级及特权
     */
    public UserLevelVO getUserLevel(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }

        UserLevelEntity userLevel = getOrCreateUserLevel(user.getFamilyId(), userId);
        LevelConfigEntity config = getConfig(user.getFamilyId(), userLevel.getLevel(), userLevel.getSubLevel());

        // 查下一阶段经验
        LevelConfigEntity nextConfig = getConfig(user.getFamilyId(), userLevel.getLevel(),
                Math.min(userLevel.getSubLevel() + 1, 3));
        // 如果小阶段已满，查下一个大等级的初期
        if (nextConfig == null || (nextConfig.getLevel().equals(userLevel.getLevel())
                && nextConfig.getSubLevel().equals(userLevel.getSubLevel()))) {
            nextConfig = getConfig(user.getFamilyId(), userLevel.getLevel() + 1, 1);
        }

        return UserLevelVO.builder()
                .userId(userId)
                .totalLevel(userLevel.getTotalLevel())
                .level(userLevel.getLevel())
                .subLevel(userLevel.getSubLevel())
                .title(config != null ? config.getTitle() : "自律新手")
                .exp(userLevel.getExp())
                .nextExpRequired(nextConfig != null ? nextConfig.getExpRequired() : null)
                .bonusPercent(config != null ? config.getBonusPercent() : 0)
                .dailySignBonus(config != null ? config.getDailySignBonus() : 0)
                .streakShield(config != null ? config.getStreakShield() : 0)
                .doubleCard(config != null ? config.getDoubleCard() : 0)
                .dailyChest(config != null && Boolean.TRUE.equals(config.getDailyChest()))
                .expBoost(config != null ? config.getExpBoost() : 0)
                .redeemDiscount(config != null ? config.getRedeemDiscount() : BigDecimal.ONE)
                .avatarFrame(config != null ? config.getAvatarFrame() : null)
                .wishDiscount(config != null ? config.getWishDiscount() : 0)
                .build();
    }

    /**
     * 每日签到
     */
    @Transactional
    public void dailySign() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate today = LocalDate.now();

        // 检查今天是否已签到
        long count = experienceLogMapper.selectCount(
                new LambdaQueryWrapper<ExperienceLogEntity>()
                        .eq(ExperienceLogEntity::getUserId, userId)
                        .eq(ExperienceLogEntity::getSource, "DAILY_SIGN")
                        .apply("DATE(created_at) = {0}", today));
        if (count > 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "今天已签到");
        }

        // 获取签到血清素奖励
        UserLevelVO level = getUserLevel(userId);
        int bonusSerum = level.getDailySignBonus();

        // 加经验
        addExperience(familyId, userId, DAILY_SIGN_EXP, "DAILY_SIGN", null, "每日签到");

        // 发放签到额外血清素
        if (bonusSerum > 0) {
            userMapper.addPoints(userId, bonusSerum);
            pointLogService.record(familyId, userId, "DAILY_SIGN", bonusSerum, null, "签到奖励血清素");
        }
    }

    /**
     * 获取等级配置列表（前端展示用）
     */
    public List<LevelConfigEntity> listConfigs(Long familyId) {
        List<LevelConfigEntity> configs = levelConfigMapper.selectList(
                new LambdaQueryWrapper<LevelConfigEntity>()
                        .eq(LevelConfigEntity::getFamilyId, familyId)
                        .orderByAsc(LevelConfigEntity::getLevel)
                        .orderByAsc(LevelConfigEntity::getSubLevel));
        if (configs.isEmpty() && familyId != 0) {
            configs = levelConfigMapper.selectList(
                    new LambdaQueryWrapper<LevelConfigEntity>()
                            .eq(LevelConfigEntity::getFamilyId, 0)
                            .orderByAsc(LevelConfigEntity::getLevel)
                            .orderByAsc(LevelConfigEntity::getSubLevel));
        }
        return configs;
    }

    /**
     * 获取当前等级配置
     */
    public LevelConfigEntity getCurrentConfig(Long familyId, Long userId) {
        UserLevelEntity userLevel = getOrCreateUserLevel(familyId, userId);
        return getConfig(familyId, userLevel.getLevel(), userLevel.getSubLevel());
    }

    // ========== 内部方法 ==========

    UserLevelEntity getOrCreateUserLevel(Long familyId, Long userId) {
        UserLevelEntity userLevel = userLevelMapper.selectOne(
                new LambdaQueryWrapper<UserLevelEntity>()
                        .eq(UserLevelEntity::getUserId, userId));
        if (userLevel == null) {
            userLevel = new UserLevelEntity();
            userLevel.setFamilyId(familyId);
            userLevel.setUserId(userId);
            userLevel.setTotalLevel(1);
            userLevel.setLevel(1);
            userLevel.setSubLevel(1);
            userLevel.setExp(0);
            userLevelMapper.insert(userLevel);
        }
        return userLevel;
    }

    LevelConfigEntity getConfig(Long familyId, int level, int subLevel) {
        LevelConfigEntity config = levelConfigMapper.selectOne(
                new LambdaQueryWrapper<LevelConfigEntity>()
                        .eq(LevelConfigEntity::getFamilyId, familyId)
                        .eq(LevelConfigEntity::getLevel, level)
                        .eq(LevelConfigEntity::getSubLevel, subLevel));
        // fallback 到 family_id=0 的默认模板
        if (config == null && familyId != 0) {
            config = levelConfigMapper.selectOne(
                    new LambdaQueryWrapper<LevelConfigEntity>()
                            .eq(LevelConfigEntity::getFamilyId, 0)
                            .eq(LevelConfigEntity::getLevel, level)
                            .eq(LevelConfigEntity::getSubLevel, subLevel));
        }
        return config;
    }

    /**
     * 根据累计经验找到对应的最高阶段配置
     */
    LevelConfigEntity findConfigByExp(Long familyId, int exp) {
        LevelConfigEntity config = levelConfigMapper.selectOne(
                new LambdaQueryWrapper<LevelConfigEntity>()
                        .eq(LevelConfigEntity::getFamilyId, familyId)
                        .le(LevelConfigEntity::getExpRequired, exp)
                        .orderByDesc(LevelConfigEntity::getExpRequired)
                        .last("LIMIT 1"));
        if (config == null && familyId != 0) {
            config = levelConfigMapper.selectOne(
                    new LambdaQueryWrapper<LevelConfigEntity>()
                            .eq(LevelConfigEntity::getFamilyId, 0)
                            .le(LevelConfigEntity::getExpRequired, exp)
                            .orderByDesc(LevelConfigEntity::getExpRequired)
                            .last("LIMIT 1"));
        }
        return config;
    }
}
