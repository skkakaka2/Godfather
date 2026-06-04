package com.family.hub.module.task.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.family.hub.common.base.BaseController;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.result.R;
import com.family.hub.module.task.dto.TaskTemplateDTO;
import com.family.hub.module.task.service.TaskTemplateService;
import com.family.hub.module.task.vo.TaskTemplateVO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/task-templates")
@Tag(name = "任务模板", description = "任务模板管理接口")
public class TaskTemplateController extends BaseController {

    private final TaskTemplateService taskTemplateService;

    @GetMapping
    @Operation(summary = "获取任务模板列表")
    public R<List<TaskTemplateVO>> list() {
        return R.ok(taskTemplateService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取任务模板详情")
    public R<TaskTemplateVO> getById(@PathVariable("id") Long id) {
        if (id == null) {
            throw new BizException(ResultCode.BAD_REQUEST, "任务模板ID不能为空");
        }
        return R.ok(taskTemplateService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建任务模板")
    public R<TaskTemplateVO> create(@RequestBody @Valid TaskTemplateDTO dto) {
        return R.ok(taskTemplateService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新任务模板")
    public R<TaskTemplateVO> update(@PathVariable Long id, @RequestBody @Valid TaskTemplateDTO dto) {
        return R.ok(taskTemplateService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除任务模板")
    public R<Void> delete(@PathVariable Long id) {
        taskTemplateService.delete(id);
        return R.ok();
    }

}
