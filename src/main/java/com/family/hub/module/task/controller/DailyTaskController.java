package com.family.hub.module.task.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.family.hub.common.result.R;

@RestController
@RequestMapping("/api/v1/tasks")
public class DailyTaskController {
    @GetMapping
    public R<List<TaskVO>> list() {
        return R.ok(taskService.list());
    }
}
