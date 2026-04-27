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
public class UserEntity extends BaseEntity {

    /** 所属家庭ID */
    private Long familyId;

    /** 登录用户名 */
    private String username;

    /** 登录密码（BCrypt加密存储） */
    private String password;

    /** 昵称 */
    private String nickname;

    /** 头像URL */
    private String avatar;

    /** 家庭角色：ADMIN-管理员、MEMBER-成员、GUEST-访客 */
    private String role;

    /** 性别：0-未知、1-男、2-女 */
    private Integer gender;

    /** 出生日期 */
    private LocalDate birthDate;

    /** 账号状态：0-禁用、1-正常 */
    private Integer status;

    /** 积分 */
    private Integer points;

    /** 内啡肽 */
    private Integer endorphins;

    /** 最后登录时间 */
    private LocalDateTime lastLoginAt;
}
