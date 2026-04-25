package com.family.hub.module.task.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.task.dto.TaskTemplateDTO;
import com.family.hub.module.task.entity.TaskTemplateEntity;
import com.family.hub.module.task.mapper.TaskTemplateMapper;
import com.family.hub.module.task.vo.TaskTemplateVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskTemplateService {

    private final TaskTemplateMapper taskTemplateMapper;

    public List<TaskTemplateVO> list() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        var wrapper = new LambdaQueryWrapper<TaskTemplateEntity>()
                .eq(TaskTemplateEntity::getFamilyId, familyId)
                .orderByAsc(TaskTemplateEntity::getSortOrder);
        List<TaskTemplateEntity> templates = taskTemplateMapper.selectList(wrapper);
        return templates.stream().map(this::toVO).toList();
    }

    public TaskTemplateVO getById(Long id) {
        TaskTemplateEntity template = taskTemplateMapper.selectById(id);
        if (template == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务模板不存在");
        }
        return toVO(template);
    }

    public TaskTemplateVO create(TaskTemplateDTO dto) {
        TaskTemplateEntity template = new TaskTemplateEntity();
        template.setFamilyId(SecurityUtils.getCurrentFamilyId());
        template.setName(dto.getName());
        template.setCategory(dto.getCategory());
        template.setIcon(dto.getIcon());
        template.setDefaultPoints(dto.getDefaultPoints());
        template.setApplicableSun(dto.getApplicableSun());
        template.setApplicableMon(dto.getApplicableMon());
        template.setApplicableTue(dto.getApplicableTue());
        template.setApplicableWed(dto.getApplicableWed());
        template.setApplicableThu(dto.getApplicableThu());
        template.setApplicableFri(dto.getApplicableFri());
        template.setApplicableSat(dto.getApplicableSat());
        template.setDeadlineTime(dto.getDeadlineTime());
        template.setSortOrder(dto.getSortOrder());
        template.setEnabled(dto.getEnabled());
        taskTemplateMapper.insert(template);
        return toVO(template);
    }

    public TaskTemplateVO update(Long id, TaskTemplateDTO dto) {
        TaskTemplateEntity template = taskTemplateMapper.selectById(id);
        if (template == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务模板不存在");
        }
        template.setName(dto.getName());
        template.setCategory(dto.getCategory());
        template.setIcon(dto.getIcon());
        template.setDefaultPoints(dto.getDefaultPoints());
        template.setApplicableSun(dto.getApplicableSun());
        template.setApplicableMon(dto.getApplicableMon());
        template.setApplicableTue(dto.getApplicableTue());
        template.setApplicableWed(dto.getApplicableWed());
        template.setApplicableThu(dto.getApplicableThu());
        template.setApplicableFri(dto.getApplicableFri());
        template.setApplicableSat(dto.getApplicableSat());
        template.setDeadlineTime(dto.getDeadlineTime());
        template.setSortOrder(dto.getSortOrder());
        template.setEnabled(dto.getEnabled());
        taskTemplateMapper.updateById(template);
        return toVO(template);
    }

    public void delete(Long id) {
        taskTemplateMapper.deleteById(id);
    }

    private TaskTemplateVO toVO(TaskTemplateEntity t) {
        return TaskTemplateVO.builder()
                .id(t.getId())
                .name(t.getName())
                .category(t.getCategory())
                .icon(t.getIcon())
                .defaultPoints(t.getDefaultPoints())
                .applicableSun(t.getApplicableSun())
                .applicableMon(t.getApplicableMon())
                .applicableTue(t.getApplicableTue())
                .applicableWed(t.getApplicableWed())
                .applicableThu(t.getApplicableThu())
                .applicableFri(t.getApplicableFri())
                .applicableSat(t.getApplicableSat())
                .deadlineTime(t.getDeadlineTime())
                .sortOrder(t.getSortOrder())
                .enabled(t.getEnabled())
                .build();
    }
}
