package com.family.hub.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 64, message = "用户名长度 3-64 位")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度 6-32 位")
    private String password;

    @Size(max = 64, message = "昵称最长 64 位")
    private String nickname;

    @Pattern(regexp = "ADMIN|PARENT|CHILD", message = "角色只能是 ADMIN、PARENT 或 CHILD")
    private String role = "PARENT";

    private String familyName;
    private Long familyId;
}
