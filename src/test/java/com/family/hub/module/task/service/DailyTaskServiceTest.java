package com.family.hub.module.task.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DailyTaskServiceTest {

    @Test
    void parentCanReviewTasks() {
        assertThat(DailyTaskService.canReviewTask("PARENT")).isTrue();
    }

    @Test
    void adminCanReviewTasks() {
        assertThat(DailyTaskService.canReviewTask("ADMIN")).isTrue();
    }

    @Test
    void childCannotReviewTasks() {
        assertThat(DailyTaskService.canReviewTask("CHILD")).isFalse();
    }
}
