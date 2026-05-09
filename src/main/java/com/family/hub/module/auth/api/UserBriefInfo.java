package com.family.hub.module.auth.api;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 用户简要信息 DTO，用于跨模块传递用户数据，不暴露 UserEntity。
 */
@Data
@AllArgsConstructor
public class UserBriefInfo {

    private Long id;

    private Long familyId;
}
