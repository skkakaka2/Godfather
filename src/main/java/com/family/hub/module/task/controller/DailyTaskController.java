package com.family.hub.module.task.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.family.hub.common.result.R;
import com.family.hub.module.task.dto.DailyTaskCompleteDTO;
import com.family.hub.module.task.dto.DailyTaskConfirmDTO;
import com.family.hub.module.task.dto.DailyTaskDTO;
import com.family.hub.module.task.dto.DailyTaskRejectDTO;
import com.family.hub.module.task.dto.DailyTaskUpdateDTO;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.service.DailyTaskService;
import com.family.hub.module.task.service.TaskGenerationService;
import com.family.hub.module.task.vo.DailyTaskVO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "日常任务管理", description = "日常任务的增删改查")
public class DailyTaskController {

    private final DailyTaskService dailyTaskService;
    private final TaskGenerationService taskGenerationService;

    @GetMapping
    @Operation(summary = "查询任务列表")
    public R<List<DailyTaskVO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) LocalDate taskDate,
            @RequestParam(required = false) String status) {
        return R.ok(dailyTaskService.list(userId, taskDate, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询任务详情")
    public R<DailyTaskVO> getById(@PathVariable Long id) {
        return R.ok(dailyTaskService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建任务")
    public R<DailyTaskVO> create(@RequestBody @Valid DailyTaskDTO dto) {
        return R.ok(dailyTaskService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新任务")
    public R<DailyTaskVO> update(@PathVariable Long id, @RequestBody @Valid DailyTaskUpdateDTO dto) {
        return R.ok(dailyTaskService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除任务")
    public R<Void> delete(@PathVariable Long id) {
        dailyTaskService.delete(id);
        return R.ok();
    }

    // 完成任务
    @PostMapping("/complete")
    @Operation(summary = "完成任务")
    public R<Void> complete(@RequestBody @Valid DailyTaskCompleteDTO dto) {
        dailyTaskService.complete(dto);
        return R.ok();
    }

    @PostMapping("/confirm")
    @Operation(summary = "确认任务")
    public R<Void> confirm(@RequestBody @Valid DailyTaskConfirmDTO dto) {
        dailyTaskService.confirm(dto);
        return R.ok();
    }

    // 查询待确认任务列表
    @GetMapping("/pending-confirm")
    @Operation(summary = "查询待确认任务列表")
    public R<List<DailyTaskEntity>> getConfirmList() {
        var result = dailyTaskService.getConfirmList();
        return R.ok(result);
    }

    @PostMapping("/reject")
    @Operation(summary = "打回任务")
    public R<Void> reject(@RequestBody @Valid DailyTaskRejectDTO dto) {
        dailyTaskService.reject(dto);
        return R.ok();
    }

    @PostMapping("/generate")
    @Operation(summary = "手动生成任务")
    public R<Void> generate(@RequestParam LocalDate date) {
        taskGenerationService.generateTasksForAllFamilies(date);
        return R.ok();
    }
}
