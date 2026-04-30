package com.family.hub.module.task.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.module.level.service.ExperienceService;
import com.family.hub.module.store.service.EndorphinService;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.entity.TaskStreakRewardEntity;
import com.family.hub.module.task.entity.TaskTemplateEntity;
import com.family.hub.module.task.mapper.DailyTaskMapper;
import com.family.hub.module.task.mapper.TaskStreakRewardMapper;
import com.family.hub.module.task.mapper.TaskTemplateMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskStreakRewardService {

    private static final Map<Integer, Integer> MILESTONE_REWARDS = Map.of(
            3, 1,
            7, 2,
            30, 5);

    private final DailyTaskMapper dailyTaskMapper;
    private final TaskStreakRewardMapper taskStreakRewardMapper;
    private final TaskTemplateMapper taskTemplateMapper;
    private final EndorphinService endorphinService;
    private final ExperienceService experienceService;

    @Transactional
    public void awardIfMilestone(DailyTaskEntity confirmedTask) {
        if (confirmedTask.getTemplateId() == null || Integer.valueOf(1).equals(confirmedTask.getIsTemp())) {
            return;
        }

        int streakDays = calculateConfirmedStreak(confirmedTask);
        Integer endorphins = MILESTONE_REWARDS.get(streakDays);
        if (endorphins == null) {
            return;
        }

        boolean alreadyAwarded = taskStreakRewardMapper.selectCount(
                new LambdaQueryWrapper<TaskStreakRewardEntity>()
                        .eq(TaskStreakRewardEntity::getDailyTaskId, confirmedTask.getId())
                        .eq(TaskStreakRewardEntity::getStreakDays, streakDays)) > 0;
        if (alreadyAwarded) {
            return;
        }

        TaskStreakRewardEntity reward = new TaskStreakRewardEntity();
        reward.setFamilyId(confirmedTask.getFamilyId());
        reward.setUserId(confirmedTask.getUserId());
        reward.setTemplateId(confirmedTask.getTemplateId());
        reward.setDailyTaskId(confirmedTask.getId());
        reward.setStreakDays(streakDays);
        reward.setEndorphinsAwarded(endorphins);
        taskStreakRewardMapper.insert(reward);

        endorphinService.addEndorphins(
                confirmedTask.getFamilyId(),
                confirmedTask.getUserId(),
                endorphins,
                confirmedTask.getId(),
                "连续打卡 " + streakDays + " 天奖励");

        experienceService.addExperience(
                confirmedTask.getFamilyId(),
                confirmedTask.getUserId(),
                streakDays,
                "TASK_STREAK",
                confirmedTask.getId(),
                "连续打卡 " + streakDays + " 天奖励经验");
    }

    int calculateConfirmedStreak(DailyTaskEntity currentTask) {
        TaskTemplateEntity template = taskTemplateMapper.selectById(currentTask.getTemplateId());
        if (template == null) {
            return 1;
        }

        LocalDate earliestDate = currentTask.getTaskDate().minusDays(60);

        var previousTasks = dailyTaskMapper.selectList(
                new LambdaQueryWrapper<DailyTaskEntity>()
                        .eq(DailyTaskEntity::getFamilyId, currentTask.getFamilyId())
                        .eq(DailyTaskEntity::getUserId, currentTask.getUserId())
                        .eq(DailyTaskEntity::getTemplateId, currentTask.getTemplateId())
                        .eq(DailyTaskEntity::getIsTemp, 0)
                        .lt(DailyTaskEntity::getTaskDate, currentTask.getTaskDate())
                        .ge(DailyTaskEntity::getTaskDate, earliestDate));

        Map<LocalDate, DailyTaskEntity> taskMap = new LinkedHashMap<>();
        previousTasks.stream().forEach(t -> {
            System.err.println(t);
        });
        for (DailyTaskEntity task : previousTasks) {
            taskMap.put(task.getTaskDate(), task);
        }

        int streakDays = 1;
        LocalDate checkDate = currentTask.getTaskDate();

        while (streakDays < 30) {
            checkDate = checkDate.minusDays(1);

            if (!template.isApplicableOn(checkDate.getDayOfWeek())) {
                continue;
            }

            DailyTaskEntity task = taskMap.get(checkDate);
            if (task != null && "CONFIRMED".equals(task.getStatus())) {
                streakDays++;
            } else {
                break;
            }
        }

        return streakDays;
    }
}
