package com.family.hub.module.task.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskCheckinVO {

    private Long id;
    private Long userId;
    private String action;
    private String photoUrl;
    private String remark;
    private LocalDateTime createdAt;
}
