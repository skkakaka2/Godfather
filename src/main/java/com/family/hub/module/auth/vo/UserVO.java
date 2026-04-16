package com.family.hub.module.auth.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserVO {

    private Long id;
    private Long familyId;
    private String username;
    private String nickname;
    private String avatar;
    private String role;
    private Integer gender;
    private LocalDate birthDate;
}
