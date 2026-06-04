package com.family.hub.module.store.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.result.PageResult;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.store.entity.EndorphinLogEntity;
import com.family.hub.module.store.mapper.EndorphinLogMapper;
import com.family.hub.module.store.vo.EndorphinLogVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EndorphinService {

    private static final int EXCHANGE_RATE = 100;

    private final UserMapper userMapper;
    private final EndorphinLogMapper endorphinLogMapper;
    private final PointLogService pointLogService;

    public Integer getBalance(Long userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            return 0;
        }
        return user.getEndorphins() != null ? user.getEndorphins() : 0;
    }

    @Transactional
    public void addEndorphins(Long familyId, Long userId, int amount, Long refId, String remark) {
        if (amount <= 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "内啡肽增加数量必须大于0");
        }

        int rows = userMapper.addEndorphins(userId, amount);
        if (rows == 0) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }

        record(familyId, userId, "EARN", amount, refId, remark);
    }

    @Transactional
    public void exchangeCurrentUser(int amount) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();
        exchange(familyId, userId, amount);
    }

    @Transactional
    public void exchange(Long familyId, Long userId, int amount) {
        if (amount <= 0) {
            throw new BizException(ResultCode.BAD_REQUEST, "兑换数量必须大于0");
        }

        int points;
        try {
            points = Math.multiplyExact(amount, EXCHANGE_RATE);
        } catch (ArithmeticException ex) {
            throw new BizException(ResultCode.BAD_REQUEST, "兑换数量过大");
        }

        int rows = userMapper.subtractEndorphins(userId, amount);
        if (rows == 0) {
            throw new BizException(ResultCode.ENDORPHIN_INSUFFICIENT, "内啡肽不足");
        }

        userMapper.addPoints(userId, points);
        record(familyId, userId, "EXCHANGE", -amount, null, "兑换多巴胺 " + points + " 点");
        pointLogService.record(familyId, userId, "ENDORPHIN_EXCHANGE", points, null,
                "内啡肽兑换多巴胺：" + amount + " 滴");
    }

    public PageResult<EndorphinLogVO> listCurrentUserLogs(String type, int page, int pageSize) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        Long userId = SecurityUtils.getCurrentUserId();
        Page<EndorphinLogEntity> pageParam = new Page<>(page, pageSize);
        var wrapper = new LambdaQueryWrapper<EndorphinLogEntity>()
                .eq(EndorphinLogEntity::getFamilyId, familyId)
                .eq(EndorphinLogEntity::getUserId, userId)
                .eq(type != null && !type.isBlank(), EndorphinLogEntity::getType, type)
                .orderByDesc(EndorphinLogEntity::getCreatedAt);
        Page<EndorphinLogEntity> result = endorphinLogMapper.selectPage(pageParam, wrapper);
        List<EndorphinLogVO> list = result.getRecords().stream().map(this::toVO).toList();
        return new PageResult<>(list, result.getTotal(), page, pageSize);
    }

    private void record(Long familyId, Long userId, String type, int amount, Long refId, String remark) {
        EndorphinLogEntity log = new EndorphinLogEntity();
        log.setFamilyId(familyId);
        log.setUserId(userId);
        log.setType(type);
        log.setAmount(amount);
        log.setBalanceAfter(getBalance(userId));
        log.setRefId(refId);
        log.setRemark(remark);
        endorphinLogMapper.insert(log);
    }

    private EndorphinLogVO toVO(EndorphinLogEntity e) {
        return EndorphinLogVO.builder()
                .id(e.getId())
                .familyId(e.getFamilyId())
                .userId(e.getUserId())
                .type(e.getType())
                .amount(e.getAmount())
                .balanceAfter(e.getBalanceAfter())
                .refId(e.getRefId())
                .remark(e.getRemark())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
