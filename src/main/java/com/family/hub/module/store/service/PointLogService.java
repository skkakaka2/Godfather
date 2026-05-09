package com.family.hub.module.store.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.family.hub.common.result.PageResult;
import com.family.hub.module.auth.api.UserFacade;
import com.family.hub.module.store.entity.PointLogEntity;
import com.family.hub.module.store.mapper.PointLogMapper;
import com.family.hub.module.store.vo.PointLogVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PointLogService {

    private final PointLogMapper pointLogMapper;
    private final UserFacade userFacade;

    public void record(Long familyId, Long userId, String type, int amount, Long refId, String remark) {
        int balanceAfter = userFacade.getPoints(userId);

        PointLogEntity log = new PointLogEntity();
        log.setFamilyId(familyId);
        log.setUserId(userId);
        log.setType(type);
        log.setAmount(amount);
        log.setBalanceAfter(balanceAfter);
        log.setRefId(refId);
        log.setRemark(remark);
        pointLogMapper.insert(log);
    }

    public List<PointLogVO> listByUser(Long userId, String type) {
        var wrapper = new LambdaQueryWrapper<PointLogEntity>()
                .eq(PointLogEntity::getUserId, userId)
                .eq(type != null && !type.isBlank(), PointLogEntity::getType, type)
                .orderByDesc(PointLogEntity::getCreatedAt);
        return pointLogMapper.selectList(wrapper).stream().map(this::toVO).toList();
    }

    public PageResult<PointLogVO> listByUserPaged(Long userId, String type, int page, int pageSize) {
        Page<PointLogEntity> pageParam = new Page<>(page, pageSize);
        var wrapper = new LambdaQueryWrapper<PointLogEntity>()
                .eq(PointLogEntity::getUserId, userId)
                .eq(type != null && !type.isBlank(), PointLogEntity::getType, type)
                .orderByDesc(PointLogEntity::getCreatedAt);
        Page<PointLogEntity> result = pointLogMapper.selectPage(pageParam, wrapper);
        List<PointLogVO> list = result.getRecords().stream().map(this::toVO).toList();
        return new PageResult<>(list, result.getTotal(), page, pageSize);
    }

    public Integer getBalance(Long userId) {
        return userFacade.getPoints(userId);
    }

    private PointLogVO toVO(PointLogEntity e) {
        return PointLogVO.builder()
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
