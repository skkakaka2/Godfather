package com.family.hub.module.task.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.task.dto.DailyTaskDTO;
import com.family.hub.module.task.dto.DailyTaskUpdateDTO;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.mapper.DailyTaskMapper;
import com.family.hub.module.task.vo.DailyTaskVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DailyTaskService {

    private final DailyTaskMapper dailyTaskMapper;

    public List<DailyTaskVO> list(Long userId, java.time.LocalDate taskDate, String status) {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<DailyTaskEntity>()
                .eq(DailyTaskEntity::getFamilyId, familyId);
        if (userId != null) {
            wrapper.eq(DailyTaskEntity::getUserId, userId);
        }
        if (taskDate != null) {
            wrapper.eq(DailyTaskEntity::getTaskDate, taskDate);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(DailyTaskEntity::getStatus, status);
        }
        wrapper.orderByDesc(DailyTaskEntity::getTaskDate)
                .orderByAsc(DailyTaskEntity::getSortOrder)
                .orderByDesc(DailyTaskEntity::getCreatedAt);
        List<DailyTaskEntity> tasks = dailyTaskMapper.selectList(wrapper);
        return tasks.stream().map(this::toVO).toList();
    }

    public DailyTaskVO getById(Long id) {
        DailyTaskEntity task = dailyTaskMapper.selectById(id);
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权访问该任务");
        }
        return toVO(task);
    }

    public DailyTaskVO create(DailyTaskDTO dto) {
        DailyTaskEntity task = new DailyTaskEntity();
        task.setFamilyId(SecurityUtils.getCurrentFamilyId());
        task.setUserId(dto.getUserId());
        task.setTemplateId(dto.getTemplateId());
        task.setTaskDate(dto.getTaskDate());
        task.setName(dto.getName());
        task.setCategory(dto.getCategory());
        task.setIcon(dto.getIcon());
        task.setPoints(dto.getPoints());
        task.setDeadlineTime(dto.getDeadlineTime());
        task.setSortOrder(dto.getSortOrder());
        task.setIsTemp(dto.getIsTemp());
        task.setStatus("PENDING");
        task.setReminded(0);
        dailyTaskMapper.insert(task);
        return toVO(task);
    }

    public DailyTaskVO update(Long id, DailyTaskUpdateDTO dto) {
        DailyTaskEntity task = dailyTaskMapper.selectById(id);
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权修改该任务");
        }
        if (dto.getName() != null) {
            task.setName(dto.getName());
        }
        if (dto.getIcon() != null) {
            task.setIcon(dto.getIcon());
        }
        if (dto.getPoints() != null) {
            task.setPoints(dto.getPoints());
        }
        if (dto.getDeadlineTime() != null) {
            task.setDeadlineTime(dto.getDeadlineTime());
        }
        if (dto.getSortOrder() != null) {
            task.setSortOrder(dto.getSortOrder());
        }
        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
        }
        dailyTaskMapper.updateById(task);
        return toVO(task);
    }

    public void delete(Long id) {
        DailyTaskEntity task = dailyTaskMapper.selectById(id);
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权删除该任务");
        }
        dailyTaskMapper.deleteById(id);
    }

    private DailyTaskVO toVO(DailyTaskEntity t) {
        return DailyTaskVO.builder()
                .id(t.getId())
                .familyId(t.getFamilyId())
                .userId(t.getUserId())
                .templateId(t.getTemplateId())
                .taskDate(t.getTaskDate())
                .name(t.getName())
                .category(t.getCategory())
                .icon(t.getIcon())
                .points(t.getPoints())
                .deadlineTime(t.getDeadlineTime())
                .sortOrder(t.getSortOrder())
                .status(t.getStatus())
                .isTemp(t.getIsTemp())
                .reminded(t.getReminded())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
