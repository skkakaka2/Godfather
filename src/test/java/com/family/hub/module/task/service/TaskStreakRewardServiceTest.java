package com.family.hub.module.task.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.family.hub.module.store.service.EndorphinService;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.entity.TaskStreakRewardEntity;
import com.family.hub.module.task.mapper.DailyTaskMapper;
import com.family.hub.module.task.mapper.TaskStreakRewardMapper;

@ExtendWith(MockitoExtension.class)
class TaskStreakRewardServiceTest {

    @Mock
    private DailyTaskMapper dailyTaskMapper;

    @Mock
    private TaskStreakRewardMapper taskStreakRewardMapper;

    @Mock
    private EndorphinService endorphinService;

    @ParameterizedTest
    @CsvSource({
            "3, 1",
            "7, 2",
            "30, 5"
    })
    void awardIfMilestoneRewardsConfiguredEndorphins(int streakDays, int endorphins) {
        TaskStreakRewardService service = new TaskStreakRewardService(
                dailyTaskMapper, taskStreakRewardMapper, endorphinService);
        DailyTaskEntity current = task(100L, LocalDate.of(2026, 4, 30), "CONFIRMED", 10L);

        when(dailyTaskMapper.selectList(any())).thenReturn(confirmedPreviousTasks(streakDays - 1));
        when(taskStreakRewardMapper.selectCount(any())).thenReturn(0L);

        service.awardIfMilestone(current);

        ArgumentCaptor<TaskStreakRewardEntity> rewardCaptor = ArgumentCaptor.forClass(TaskStreakRewardEntity.class);
        verify(taskStreakRewardMapper).insert(rewardCaptor.capture());
        TaskStreakRewardEntity reward = rewardCaptor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(streakDays, reward.getStreakDays());
        org.junit.jupiter.api.Assertions.assertEquals(endorphins, reward.getEndorphinsAwarded());
        verify(endorphinService).addEndorphins(1L, 2L, endorphins, 100L,
                "连续打卡 " + streakDays + " 天奖励");
    }

    @Test
    void awardIfMilestoneDoesNotRewardNonMilestoneStreaks() {
        TaskStreakRewardService service = new TaskStreakRewardService(
                dailyTaskMapper, taskStreakRewardMapper, endorphinService);
        DailyTaskEntity current = task(100L, LocalDate.of(2026, 4, 4), "CONFIRMED", 10L);

        when(dailyTaskMapper.selectList(any())).thenReturn(confirmedPreviousTasks(3));

        service.awardIfMilestone(current);

        verify(taskStreakRewardMapper, never()).insert(any(TaskStreakRewardEntity.class));
        verifyNoInteractions(endorphinService);
    }

    @Test
    void awardIfMilestoneIgnoresTempTasks() {
        TaskStreakRewardService service = new TaskStreakRewardService(
                dailyTaskMapper, taskStreakRewardMapper, endorphinService);
        DailyTaskEntity current = task(100L, LocalDate.of(2026, 4, 4), "CONFIRMED", 10L);
        current.setIsTemp(1);

        service.awardIfMilestone(current);

        verifyNoInteractions(dailyTaskMapper, taskStreakRewardMapper, endorphinService);
    }

    @Test
    void calculateConfirmedStreakStopsAtFirstUnconfirmedTask() {
        TaskStreakRewardService service = new TaskStreakRewardService(
                dailyTaskMapper, taskStreakRewardMapper, endorphinService);
        DailyTaskEntity current = task(100L, LocalDate.of(2026, 4, 4), "CONFIRMED", 10L);
        List<DailyTaskEntity> previousTasks = List.of(
                task(99L, LocalDate.of(2026, 4, 3), "CONFIRMED", 10L),
                task(98L, LocalDate.of(2026, 4, 2), "PENDING", 10L),
                task(97L, LocalDate.of(2026, 4, 1), "CONFIRMED", 10L));
        when(dailyTaskMapper.selectList(any())).thenReturn(previousTasks);

        org.junit.jupiter.api.Assertions.assertEquals(2, service.calculateConfirmedStreak(current));
    }

    private static List<DailyTaskEntity> confirmedPreviousTasks(int count) {
        List<DailyTaskEntity> tasks = new ArrayList<>();
        LocalDate date = LocalDate.of(2026, 4, 29);
        for (int i = 0; i < count; i++) {
            tasks.add(task(99L - i, date.minusDays(i * 2L), "CONFIRMED", 10L));
        }
        return tasks;
    }

    private static DailyTaskEntity task(Long id, LocalDate taskDate, String status, Long templateId) {
        DailyTaskEntity task = new DailyTaskEntity();
        task.setId(id);
        task.setFamilyId(1L);
        task.setUserId(2L);
        task.setTemplateId(templateId);
        task.setTaskDate(taskDate);
        task.setStatus(status);
        task.setIsTemp(0);
        return task;
    }
}
