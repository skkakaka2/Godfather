package com.family.hub.module.auth.api;

import java.util.List;

import org.springframework.stereotype.Component;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserFacadeImpl implements UserFacade {

    private final UserMapper userMapper;

    @Override
    public Long getFamilyId(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        return user != null ? user.getFamilyId() : null;
    }

    @Override
    public boolean existsInFamily(Long userId, Long familyId) {
        UserEntity user = userMapper.selectById(userId);
        return user != null && familyId.equals(user.getFamilyId());
    }

    @Override
    public List<UserBriefInfo> getAllActiveChildren() {
        return userMapper.selectList(
                new LambdaQueryWrapper<UserEntity>()
                        .eq(UserEntity::getStatus, 1)
                        .eq(UserEntity::getRole, "CHILD"))
                .stream()
                .map(u -> new UserBriefInfo(u.getId(), u.getFamilyId()))
                .toList();
    }

    @Override
    public int getPoints(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null || user.getPoints() == null) {
            return 0;
        }
        return user.getPoints();
    }

    @Override
    public int getEndorphins(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null || user.getEndorphins() == null) {
            return 0;
        }
        return user.getEndorphins();
    }

    @Override
    public boolean isAdminOrParent(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        return "ADMIN".equals(user.getRole()) || "PARENT".equals(user.getRole());
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
}
