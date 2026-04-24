package com.family.hub.module.auth.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserVO {

    /** 用户ID */
    private Long id;

    /** 所属家庭ID */
    private Long familyId;

    /** 登录用户名 */
    private String username;

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

    /** 积分 */
    private Integer points;
}
