package com.family.hub.module.auth.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.dto.LoginRequest;
import com.family.hub.module.auth.dto.RegisterRequest;
import com.family.hub.module.auth.entity.Family;
import com.family.hub.module.auth.entity.User;
import com.family.hub.module.auth.mapper.FamilyMapper;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.security.JwtTokenProvider;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.auth.vo.LoginVO;
import com.family.hub.module.auth.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final FamilyMapper familyMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Override
    public LoginVO login(LoginRequest request) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null) {
            throw new BizException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BizException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);

        return buildLoginVO(user);
    }

    @Override
    @Transactional
    public LoginVO register(RegisterRequest request) {
        Long familyId = request.getFamilyId();

        if (familyId == null) {
            Family family = new Family();
            family.setName(request.getFamilyName() != null ? request.getFamilyName() : "我的家庭");
            family.setInviteCode(IdUtil.fastSimpleUUID().substring(0, 8).toUpperCase());
            family.setStatus(1);
            familyMapper.insert(family);
            familyId = family.getId();
        }

        Long existCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>()
                        .eq(User::getFamilyId, familyId)
                        .eq(User::getUsername, request.getUsername()));
        if (existCount > 0) {
            throw new BizException(ResultCode.CONFLICT, "用户名已存在");
        }

        User user = new User();
        user.setFamilyId(familyId);
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setRole(request.getRole());
        user.setStatus(1);
        userMapper.insert(user);

        return buildLoginVO(user);
    }

    @Override
    public UserVO getCurrentUserInfo() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return toUserVO(user);
    }

    @Override
    public List<UserVO> getFamilyMembers() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .eq(User::getFamilyId, familyId)
                        .eq(User::getStatus, 1)
                        .orderByAsc(User::getRole));
        return users.stream().map(this::toUserVO).toList();
    }

    @Override
    public UserVO updateUserInfo(Long userId, String nickname, String avatar) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new BizException(ResultCode.FORBIDDEN);
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }

        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (avatar != null) {
            user.setAvatar(avatar);
        }
        userMapper.updateById(user);
        return toUserVO(user);
    }

    private LoginVO buildLoginVO(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getFamilyId(), user.getUsername(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getFamilyId(), user.getUsername(), user.getRole());

        return LoginVO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(accessTokenExpiration / 1000)
                .user(toUserVO(user))
                .build();
    }

    private UserVO toUserVO(User user) {
        return UserVO.builder()
                .id(user.getId())
                .familyId(user.getFamilyId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .gender(user.getGender())
                .birthDate(user.getBirthDate())
                .build();
    }
}
