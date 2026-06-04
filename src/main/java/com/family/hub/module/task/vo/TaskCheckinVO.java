package com.family.hub.module.task.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TaskCheckinVO {

    private Long id;
    private Long userId;
    private String action;
    private List<String> photoUrls;
    private String remark;
    private LocalDateTime createdAt;
}
