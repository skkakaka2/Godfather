package com.family.hub.module.auth.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends BaseEntity {

    private Long familyId;
    private String username;
    private String password;
    private String nickname;
    private String avatar;
    private String role;
    private Integer gender;
    private LocalDate birthDate;
    private Integer status;
    private LocalDateTime lastLoginAt;
}
