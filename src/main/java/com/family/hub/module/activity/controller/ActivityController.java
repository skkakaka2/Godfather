package com.family.hub.module.activity.controller;

import com.family.hub.common.result.R;
import com.family.hub.module.activity.dto.ActivityCreateDTO;
import com.family.hub.module.activity.dto.ActivityUpdateDTO;
import com.family.hub.module.activity.service.ActivityService;
import com.family.hub.module.activity.vo.ActivityVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
@Tag(name = "活动管理", description = "节日活动的增删改查和上下线")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "查询活动列表")
    public R<List<ActivityVO>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return R.ok(activityService.list(type, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询活动详情")
    public R<ActivityVO> getById(@PathVariable Long id) {
        return R.ok(activityService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建活动")
    public R<ActivityVO> create(@RequestBody @Valid ActivityCreateDTO dto) {
        return R.ok(activityService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新活动")
    public R<ActivityVO> update(@PathVariable Long id, @RequestBody @Valid ActivityUpdateDTO dto) {
        return R.ok(activityService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除活动")
    public R<Void> delete(@PathVariable Long id) {
        activityService.delete(id);
        return R.ok();
    }

    @PutMapping("/{id}/toggle")
    @Operation(summary = "上线/下线切换")
    public R<Void> toggleStatus(@PathVariable Long id) {
        activityService.toggleStatus(id);
        return R.ok();
    }

    @GetMapping("/active")
    @Operation(summary = "获取当前家庭进行中的活动")
    public R<List<ActivityVO>> getActiveActivities() {
        return R.ok(activityService.getActiveActivities());
    }
}
