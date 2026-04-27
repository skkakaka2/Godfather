package com.family.hub.module.auth.service;

import com.family.hub.module.auth.dto.LoginRequest;
import com.family.hub.module.auth.dto.RegisterRequest;
import com.family.hub.module.auth.enums.RoleEnum;
import com.family.hub.module.auth.vo.LoginVO;
import com.family.hub.module.auth.vo.UserVO;

import java.util.List;

public interface UserService {

    LoginVO login(LoginRequest request);

    LoginVO register(RegisterRequest request);

    UserVO getCurrentUserInfo();

    List<UserVO> getFamilyMembers();

    UserVO updateUserInfo(Long userId, String nickname, String avatar, RoleEnum role);

    int addPoints(Long userId, Integer points);

    int subtractPoints(Long userId, Integer points);

    int addEndorphins(Long userId, Integer amount);

    int subtractEndorphins(Long userId, Integer amount);

    boolean isAdmin(Long userId);

    boolean isParent(Long userId);

    boolean isChild(Long userId);
}
