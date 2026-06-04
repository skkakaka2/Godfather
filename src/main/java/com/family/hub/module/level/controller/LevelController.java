package com.family.hub.module.level.controller;

import com.family.hub.common.result.R;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.level.entity.LevelConfigEntity;
import com.family.hub.module.level.service.ExperienceService;
import com.family.hub.module.level.service.PrivilegeService;
import com.family.hub.module.level.vo.ChestResultVO;
import com.family.hub.module.level.vo.UserLevelVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/level")
@RequiredArgsConstructor
@Tag(name = "等级系统", description = "等级查询、签到、特权使用")
public class LevelController {

    private final ExperienceService experienceService;
    private final PrivilegeService privilegeService;

    @GetMapping("/info")
    @Operation(summary = "查询当前等级信息")
    public R<UserLevelVO> getInfo() {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.ok(experienceService.getUserLevel(userId));
    }

    @PostMapping("/sign")
    @Operation(summary = "每日签到")
    public R<Void> dailySign() {
        experienceService.dailySign();
        return R.ok();
    }

    @PostMapping("/chest")
    @Operation(summary = "开宝箱（Lv.6+）")
    public R<ChestResultVO> openChest() {
        return R.ok(privilegeService.openDailyChest());
    }

    @PostMapping("/double-card")
    @Operation(summary = "使用翻倍卡（Lv.5+）")
    public R<Void> useDoubleCard() {
        privilegeService.useDoubleCard();
        return R.ok();
    }

    @PostMapping("/wish/{rewardId}")
    @Operation(summary = "愿望直达（Lv.10）")
    public R<Void> useWishDirect(@PathVariable Long rewardId) {
        privilegeService.useWishDirect(rewardId);
        return R.ok();
    }

    @GetMapping("/config")
    @Operation(summary = "等级配置列表")
    public R<List<LevelConfigEntity>> listConfigs() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        return R.ok(experienceService.listConfigs(familyId));
    }
}
