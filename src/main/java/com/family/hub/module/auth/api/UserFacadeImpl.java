package com.family.hub.module.auth.api;

import org.springframework.stereotype.Component;

import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserFacadeImpl implements UserFacade {

    private final UserMapper userMapper;

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
