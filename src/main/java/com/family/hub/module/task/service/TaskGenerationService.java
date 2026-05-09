package com.family.hub.module.task.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.module.auth.api.UserBriefInfo;
import com.family.hub.module.auth.api.UserFacade;
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
    private final UserFacade userFacade;

    @Transactional
    public void generateTasksForAllFamilies(LocalDate taskDate) {
        DayOfWeek dayOfWeek = taskDate.getDayOfWeek();

        List<TaskTemplateEntity> allTemplates = taskTemplateMapper.selectList(
                new LambdaQueryWrapper<TaskTemplateEntity>()
                        .eq(TaskTemplateEntity::getEnabled, 1));

        List<UserBriefInfo> allChildren = userFacade.getAllActiveChildren();

        List<DailyTaskEntity> tasksToCreate = new ArrayList<>();

        for (TaskTemplateEntity template : allTemplates) {
            if (!template.isApplicableOn(dayOfWeek)) {
                continue;
            }

            for (UserBriefInfo child : allChildren) {
                if (!child.getFamilyId().equals(template.getFamilyId())) {
                    continue;
                }

                boolean alreadyExists = dailyTaskMapper.selectCount(
                        new LambdaQueryWrapper<DailyTaskEntity>()
                                .eq(DailyTaskEntity::getFamilyId, template.getFamilyId())
                                .eq(DailyTaskEntity::getUserId, child.getId())
                                .eq(DailyTaskEntity::getTaskDate, taskDate)
                                .eq(DailyTaskEntity::getTemplateId, template.getId())) > 0;

                if (alreadyExists) {
                    continue;
                }

                DailyTaskEntity task = new DailyTaskEntity();
                task.setFamilyId(template.getFamilyId());
                task.setUserId(child.getId());
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
                allChildren.size(),
                tasksToCreate.size());
    }

}
