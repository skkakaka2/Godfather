package com.family.hub.module.task.schedule;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.family.hub.common.utils.RedisLock;
import com.family.hub.module.task.service.TaskGenerationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskScheduler {

    private final TaskGenerationService taskGenerationService;
    private final RedisLock redisLock;

    private static final String LOCK_KEY = "task:generate:daily";

    @Scheduled(cron = "${app.schedule.task-generation-cron}", scheduler = "scheduledTaskExecutor")
    public void generateDailyTasks() {
        if (!redisLock.tryLock(LOCK_KEY)) {
            log.info("其他实例正在执行任务生成，当前实例跳过");
            return;
        }

        try {
            log.info("开始生成每日任务，日期: {}", LocalDate.now());
            taskGenerationService.generateTasksForAllFamilies(LocalDate.now());
            log.info("每日任务生成完成");
        } finally {
            redisLock.unlock(LOCK_KEY);
        }
    }
}
