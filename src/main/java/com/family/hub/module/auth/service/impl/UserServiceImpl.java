package com.family.hub.module.auth.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.dto.LoginRequest;
import com.family.hub.module.auth.dto.RegisterRequest;
import com.family.hub.module.auth.entity.FamilyEntity;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.enums.RoleEnum;
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
        UserEntity user = userMapper.selectOne(
                new LambdaQueryWrapper<UserEntity>().eq(UserEntity::getUsername, request.getUsername()));
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
            FamilyEntity family = new FamilyEntity();
            family.setName(request.getFamilyName() != null ? request.getFamilyName() : "我的家庭");
            family.setInviteCode(IdUtil.fastSimpleUUID().substring(0, 8).toUpperCase());
            family.setStatus(1);
            familyMapper.insert(family);
            familyId = family.getId();
        }

        Long existCount = userMapper.selectCount(
                new LambdaQueryWrapper<UserEntity>()
                        .eq(UserEntity::getFamilyId, familyId)
                        .eq(UserEntity::getUsername, request.getUsername()));
        if (existCount > 0) {
            throw new BizException(ResultCode.CONFLICT, "用户名已存在");
        }

        UserEntity user = new UserEntity();
        user.setFamilyId(familyId);
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setRole(request.getRole());
        user.setStatus(1);
        user.setPoints(0);
        user.setEndorphins(0);
        userMapper.insert(user);

        return buildLoginVO(user);
    }

    @Override
    public UserVO getCurrentUserInfo() {
        Long userId = SecurityUtils.getCurrentUserId();
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return toUserVO(user);
    }

    @Override
    public List<UserVO> getFamilyMembers() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        List<UserEntity> users = userMapper.selectList(
                new LambdaQueryWrapper<UserEntity>()
                        .eq(UserEntity::getFamilyId, familyId)
                        .eq(UserEntity::getStatus, 1)
                        .orderByAsc(UserEntity::getRole));
        return users.stream().map(this::toUserVO).toList();
    }

    @Override
    public UserVO updateUserInfo(Long userId, String nickname, String avatar, RoleEnum role) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserEntity currentUser = userMapper.selectById(currentUserId);
        boolean isAdminOrParent = "ADMIN".equals(currentUser.getRole()) || "PARENT".equals(currentUser.getRole());

        if (!currentUserId.equals(userId) && !isAdminOrParent) {
            throw new BizException(ResultCode.FORBIDDEN);
        }

        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }

        if (!currentUserId.equals(userId)) {
            if (!user.getFamilyId().equals(currentUser.getFamilyId())) {
                throw new BizException(ResultCode.FORBIDDEN);
            }
        }

        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (avatar != null) {
            user.setAvatar(avatar);
        }
        if (role.getValue() != null) {
            user.setRole(role.getValue());
        }
        userMapper.updateById(user);
        return toUserVO(user);
    }

    @Override
    public void changeCurrentUserPassword(String currentPassword, String newPassword) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserEntity user = userMapper.selectById(currentUserId);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BizException(ResultCode.BAD_REQUEST, "当前密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }

    @Override
    public int addPoints(Long userId, Integer points) {
        return userMapper.addPoints(userId, points);
    }

    @Override
    public int subtractPoints(Long userId, Integer points) {
        return userMapper.subtractPoints(userId, points);
    }

    @Override
    public int addEndorphins(Long userId, Integer amount) {
        return userMapper.addEndorphins(userId, amount);
    }

    @Override
    public int subtractEndorphins(Long userId, Integer amount) {
        return userMapper.subtractEndorphins(userId, amount);
    }

    public boolean isAdmin(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        return user.getRole().equals("ADMIN");
    }

    public boolean isParent(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        return user.getRole().equals("PARENT");
    }

    public boolean isChild(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        return user.getRole().equals("CHILD");
    }

    private LoginVO buildLoginVO(UserEntity user) {
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

    private UserVO toUserVO(UserEntity user) {
        return UserVO.builder()
                .id(user.getId())
                .familyId(user.getFamilyId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .gender(user.getGender())
                .birthDate(user.getBirthDate())
                .points(user.getPoints())
                .endorphins(user.getEndorphins())
                .build();
    }
}
