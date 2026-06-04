package com.family.hub.common.utils;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisLock {

    private final StringRedisTemplate redisTemplate;

    private static final long DEFAULT_EXPIRE = 60;
    private static final String LOCK_PREFIX = "lock:";

    public boolean tryLock(String lockKey) {
        return tryLock(lockKey, DEFAULT_EXPIRE);
    }

    public boolean tryLock(String lockKey, long expireSeconds) {
        String key = LOCK_PREFIX + lockKey;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(key, "1", expireSeconds, TimeUnit.SECONDS);
        if (Boolean.TRUE.equals(acquired)) {
            log.debug("获取锁成功: {}", key);
            return true;
        }
        log.debug("获取锁失败: {}", key);
        return false;
    }

    public void unlock(String lockKey) {
        String key = LOCK_PREFIX + lockKey;
        redisTemplate.delete(key);
        log.debug("释放锁: {}", key);
    }
}
