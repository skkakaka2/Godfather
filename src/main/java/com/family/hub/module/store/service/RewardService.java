package com.family.hub.module.store.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.api.UserFacade;
import com.family.hub.module.store.dto.RewardDTO;
import com.family.hub.module.store.entity.RewardEntity;
import com.family.hub.module.store.mapper.RewardMapper;
import com.family.hub.module.store.vo.RewardVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardMapper rewardMapper;
    private final UserFacade userFacade;

    public List<RewardVO> list(String status) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<RewardEntity>()
                .eq(RewardEntity::getFamilyId, familyId);
        if (status != null && !status.isBlank()) {
            wrapper.eq(RewardEntity::getStatus, status);
        }
        wrapper.orderByAsc(RewardEntity::getCreatedAt);
        var list = rewardMapper.selectList(wrapper);
        return list.stream().map(this::toVO).toList();
    }

    public RewardVO getById(Long id) {
        RewardEntity entity = rewardMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "奖励商品不存在");
        }
        checkFamilyAccess(entity);
        return toVO(entity);
    }

    public RewardVO create(RewardDTO dto) {
        checkAdminPermission();
        Long familyId = SecurityUtils.getCurrentFamilyId();

        RewardEntity entity = new RewardEntity();
        entity.setFamilyId(familyId);
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPointsPrice(dto.getPointsPrice());
        entity.setImageUrl(dto.getImageUrl());
        entity.setStock(dto.getStock());
        entity.setStatus("ON");
        rewardMapper.insert(entity);
        return toVO(entity);
    }

    public RewardVO update(Long id, RewardDTO dto) {
        checkAdminPermission();
        RewardEntity entity = rewardMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "奖励商品不存在");
        }
        checkFamilyAccess(entity);

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPointsPrice(dto.getPointsPrice());
        entity.setImageUrl(dto.getImageUrl());
        entity.setStock(dto.getStock());
        rewardMapper.updateById(entity);
        return toVO(entity);
    }

    public void delete(Long id) {
        checkAdminPermission();
        RewardEntity entity = rewardMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "奖励商品不存在");
        }
        checkFamilyAccess(entity);
        rewardMapper.deleteById(id);
    }

    public void toggleStatus(Long id) {
        checkAdminPermission();
        RewardEntity entity = rewardMapper.selectById(id);
        if (entity == null) {
            throw new BizException(ResultCode.NOT_FOUND, "奖励商品不存在");
        }
        checkFamilyAccess(entity);

        entity.setStatus("ON".equals(entity.getStatus()) ? "OFF" : "ON");
        rewardMapper.updateById(entity);
    }

    private void checkAdminPermission() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!userFacade.isAdminOrParent(userId)) {
            throw new BizException(ResultCode.FORBIDDEN, "只有家长可以管理奖励商品");
        }
    }

    private void checkFamilyAccess(RewardEntity entity) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!entity.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该奖励商品");
        }
    }

    private RewardVO toVO(RewardEntity e) {
        return RewardVO.builder()
                .id(e.getId())
                .familyId(e.getFamilyId())
                .name(e.getName())
                .description(e.getDescription())
                .pointsPrice(e.getPointsPrice())
                .imageUrl(e.getImageUrl())
                .stock(e.getStock())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
