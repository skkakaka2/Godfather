package com.family.hub.module.task.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class TaskTemplateVO {

    private Long id;
    private String name;
    private String category;
    private String icon;
    private Integer defaultPoints;
    private Integer applicableSun;
    private Integer applicableMon;
    private Integer applicableTue;
    private Integer applicableWed;
    private Integer applicableThu;
    private Integer applicableFri;
    private Integer applicableSat;
    private LocalTime deadlineTime;
    private Integer sortOrder;
    private Integer enabled;
}
