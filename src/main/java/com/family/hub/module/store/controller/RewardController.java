package com.family.hub.module.store.controller;

import com.family.hub.common.result.R;
import com.family.hub.module.store.dto.RewardDTO;
import com.family.hub.module.store.service.RewardService;
import com.family.hub.module.store.vo.RewardVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/store/rewards")
@RequiredArgsConstructor
@Tag(name = "奖励商品管理", description = "奖励商品的增删改查和上下架")
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    @Operation(summary = "查询奖励商品列表")
    public R<List<RewardVO>> list(@RequestParam(required = false) String status) {
        return R.ok(rewardService.list(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询奖励商品详情")
    public R<RewardVO> getById(@PathVariable Long id) {
        return R.ok(rewardService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建奖励商品")
    public R<RewardVO> create(@RequestBody @Valid RewardDTO dto) {
        return R.ok(rewardService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新奖励商品")
    public R<RewardVO> update(@PathVariable Long id, @RequestBody @Valid RewardDTO dto) {
        return R.ok(rewardService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除奖励商品")
    public R<Void> delete(@PathVariable Long id) {
        rewardService.delete(id);
        return R.ok();
    }

    @PutMapping("/{id}/toggle")
    @Operation(summary = "上架/下架切换")
    public R<Void> toggleStatus(@PathVariable Long id) {
        rewardService.toggleStatus(id);
        return R.ok();
    }
}
