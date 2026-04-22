package com.family.hub.module.task.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.module.auth.entity.User;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.entity.TaskTemplateEntity;
import com.family.hub.module.task.mapper.DailyTaskMapper;
import com.family.hub.module.task.mapper.TaskTemplateMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskGenerationService {

    private final TaskTemplateMapper taskTemplateMapper;
    private final DailyTaskMapper dailyTaskMapper;
    private final UserMapper userMapper;

    @Transactional
    public void generateTasksForAllFamilies(LocalDate taskDate) {
        DayOfWeek dayOfWeek = taskDate.getDayOfWeek();

        List<TaskTemplateEntity> allTemplates = taskTemplateMapper.selectList(
                new LambdaQueryWrapper<TaskTemplateEntity>()
                        .eq(TaskTemplateEntity::getEnabled, 1));

        List<User> allUsers = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .eq(User::getStatus, 1));

        List<DailyTaskEntity> tasksToCreate = new ArrayList<>();

        for (TaskTemplateEntity template : allTemplates) {
            if (!isApplicableForDay(template, dayOfWeek)) {
                continue;
            }

            for (User user : allUsers) {
                if (!user.getFamilyId().equals(template.getFamilyId())) {
                    continue;
                }

                boolean alreadyExists = dailyTaskMapper.selectCount(
                        new LambdaQueryWrapper<DailyTaskEntity>()
                                .eq(DailyTaskEntity::getFamilyId, template.getFamilyId())
                                .eq(DailyTaskEntity::getUserId, user.getId())
                                .eq(DailyTaskEntity::getTaskDate, taskDate)
                                .eq(DailyTaskEntity::getTemplateId, template.getId())) > 0;

                if (alreadyExists) {
                    continue;
                }

                DailyTaskEntity task = new DailyTaskEntity();
                task.setFamilyId(template.getFamilyId());
                task.setUserId(user.getId());
                task.setTemplateId(template.getId());
                task.setTaskDate(taskDate);
                task.setName(template.getName());
                task.setCategory(template.getCategory());
                task.setIcon(template.getIcon());
                task.setPoints(template.getDefaultPoints());
                task.setDeadlineTime(template.getDeadlineTime());
                task.setSortOrder(template.getSortOrder());
                task.setStatus("PENDING");
                task.setIsTemp(0);
                task.setReminded(0);

                tasksToCreate.add(task);
            }
        }

        for (DailyTaskEntity task : tasksToCreate) {
            dailyTaskMapper.insert(task);
        }

        log.info("为 {} 个家庭的 {} 个用户生成了 {} 条每日任务",
                allTemplates.stream().map(TaskTemplateEntity::getFamilyId).distinct().count(),
                allUsers.size(),
                tasksToCreate.size());
    }

    private boolean isApplicableForDay(TaskTemplateEntity template, DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case SUNDAY -> template.getApplicableSun() == 1;
            case MONDAY -> template.getApplicableMon() == 1;
            case TUESDAY -> template.getApplicableTue() == 1;
            case WEDNESDAY -> template.getApplicableWed() == 1;
            case THURSDAY -> template.getApplicableThu() == 1;
            case FRIDAY -> template.getApplicableFri() == 1;
            case SATURDAY -> template.getApplicableSat() == 1;
        };
    }
}
