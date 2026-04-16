package com.family.hub.module.auth.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginVO {

    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private UserVO user;
}
