package com.family.hub.module.task.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.enums.RoleEnum;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.store.service.PointLogService;
import com.family.hub.module.task.dto.DailyTaskCompleteDTO;
import com.family.hub.module.task.dto.DailyTaskConfirmDTO;
import com.family.hub.module.task.dto.DailyTaskDTO;
import com.family.hub.module.task.dto.DailyTaskRejectDTO;
import com.family.hub.module.task.dto.DailyTaskUpdateDTO;
import com.family.hub.module.task.entity.DailyTaskEntity;
import com.family.hub.module.task.entity.TaskCheckinEntity;
import com.family.hub.module.task.entity.TaskTemplateEntity;
import com.family.hub.module.task.mapper.DailyTaskMapper;
import com.family.hub.module.task.mapper.TaskCheckinMapper;
import com.family.hub.module.task.mapper.TaskTemplateMapper;
import com.family.hub.module.level.service.ExperienceService;
import com.family.hub.module.level.service.PrivilegeService;
import com.family.hub.module.level.entity.LevelConfigEntity;
import com.family.hub.module.task.vo.DailyTaskVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DailyTaskService {

    private final DailyTaskMapper dailyTaskMapper;
    private final TaskCheckinMapper taskCheckinMapper;
    private final UserMapper userMapper;
    private final TaskTemplateMapper taskTemplateMapper;
    private final UserService userService;
    private final TaskStreakRewardService taskStreakRewardService;
    private final PointLogService pointLogService;
    private final ExperienceService experienceService;
    private final PrivilegeService privilegeService;

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
        Long familyId = SecurityUtils.getCurrentFamilyId();

        // 校验权限：只有家长和管理员可以创建任务
        String role = SecurityUtils.getCurrentUser().getRole();
        var roleList = Arrays.asList(RoleEnum.ADMIN.getValue(), RoleEnum.PARENT.getValue());
        if (!roleList.contains(role)) {
            throw new BizException(ResultCode.FORBIDDEN, "只有家长和管理员可以创建任务");
        }

        // 校验用户存在且属于当前家庭
        UserEntity user = userMapper.selectById(dto.getUserId());
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }
        if (!user.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "用户不属于当前家庭");
        }

        // 校验模板存在且属于当前家庭（如果传了 templateId）
        if (dto.getTemplateId() != null) {
            TaskTemplateEntity template = taskTemplateMapper.selectById(dto.getTemplateId());
            if (template == null) {
                throw new BizException(ResultCode.NOT_FOUND, "任务模板不存在");
            }
            if (!template.getFamilyId().equals(familyId)) {
                throw new BizException(ResultCode.FORBIDDEN, "模板不属于当前家庭");
            }
        }

        DailyTaskEntity task = new DailyTaskEntity();
        task.setFamilyId(familyId);
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

    /**
     * 打卡完成任务
     */
    @Transactional
    public void complete(DailyTaskCompleteDTO dto) {
        DailyTaskEntity task = dailyTaskMapper.selectForUpdate(dto.getId());
        Long currentUserId = SecurityUtils.getCurrentUserId();
        dto.setUserId(currentUserId);
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该任务");
        }
        String status = task.getStatus();
        if (!"PENDING".equals(status) && !"REJECTED".equals(status)) {
            throw new BizException(ResultCode.BAD_REQUEST, "任务状态不正确，无法打卡");
        }
        if (!task.getUserId().equals(dto.getUserId())) {
            throw new BizException(ResultCode.FORBIDDEN, "只能打卡自己的任务");
        }

        task.setStatus("COMPLETED");

        dailyTaskMapper.updateById(task);

        TaskCheckinEntity checkin = new TaskCheckinEntity();
        checkin.setFamilyId(familyId);
        checkin.setDailyTaskId(dto.getId());
        checkin.setUserId(dto.getUserId());
        checkin.setAction("CHECKIN");
        checkin.setPhotoUrls(dto.getPhotoUrls() == null ? new ArrayList<>() : dto.getPhotoUrls());
        checkin.setRemark(dto.getRemark());
        taskCheckinMapper.insert(checkin);
    }

    /**
     * 家长确认任务
     */
    @Transactional
    public void confirm(DailyTaskConfirmDTO dto) {
        DailyTaskEntity task = dailyTaskMapper.selectForUpdate(dto.getId());
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该任务");
        }
        if (!"COMPLETED".equals(task.getStatus())) {
            throw new BizException(ResultCode.BAD_REQUEST, "任务未打卡，无法确认");
        }
        String role = SecurityUtils.getCurrentUser().getRole();
        if (!"ADMIN".equals(role)) {
            throw new BizException(ResultCode.FORBIDDEN, "只有家长可以确认任务");
        }

        task.setStatus("CONFIRMED");
        if (dto.getPoints() != null) {
            task.setPoints(dto.getPoints());
        }

        dailyTaskMapper.updateById(task);

        userService.addPoints(task.getUserId(), task.getPoints());

        pointLogService.record(familyId, task.getUserId(), "EARN", task.getPoints(), task.getId(), "任务完成");

        // 等级加成：额外发放 bonus_percent 血清素
        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, task.getUserId());
        if (config.getBonusPercent() != null && config.getBonusPercent() > 0) {
            int bonusPoints = task.getPoints() * config.getBonusPercent() / 100;
            if (bonusPoints > 0) {
                userService.addPoints(task.getUserId(), bonusPoints);
                pointLogService.record(familyId, task.getUserId(), "BONUS", bonusPoints, task.getId(),
                        "等级加成 +" + config.getBonusPercent() + "%");
            }
        }

        // 翻倍卡：当天翻倍卡激活则再发一次等量血清素
        if (privilegeService.isDoubleCardActive(familyId, task.getUserId())) {
            userService.addPoints(task.getUserId(), task.getPoints());
            pointLogService.record(familyId, task.getUserId(), "DOUBLE_CARD", task.getPoints(), task.getId(),
                    "翻倍卡加成");
        }

        // 每个任务固定获得1点经验
        experienceService.addExperience(familyId, task.getUserId(), 1, "TASK_CONFIRM",
                task.getId(), "任务确认");

        taskStreakRewardService.awardIfMilestone(task);

        TaskCheckinEntity checkin = new TaskCheckinEntity();
        checkin.setFamilyId(familyId);
        checkin.setDailyTaskId(dto.getId());
        checkin.setUserId(SecurityUtils.getCurrentUserId());
        checkin.setAction("CONFIRM");
        checkin.setRemark(dto.getRemark());
        checkin.setPhotoUrls(new ArrayList<>());

        taskCheckinMapper.insert(checkin);
    }

    /**
     * 家长打回任务
     */
    public void reject(DailyTaskRejectDTO dto) {
        DailyTaskEntity task = dailyTaskMapper.selectById(dto.getId());
        if (task == null) {
            throw new BizException(ResultCode.NOT_FOUND, "任务不存在");
        }
        Long familyId = SecurityUtils.getCurrentFamilyId();
        if (!task.getFamilyId().equals(familyId)) {
            throw new BizException(ResultCode.FORBIDDEN, "无权操作该任务");
        }
        if (!"COMPLETED".equals(task.getStatus())) {
            throw new BizException(ResultCode.BAD_REQUEST, "任务未打卡，无法打回");
        }
        String role = SecurityUtils.getCurrentUser().getRole();
        if (!"ADMIN".equals(role)) {
            throw new BizException(ResultCode.FORBIDDEN, "只有家长可以打回任务");
        }

        task.setStatus("REJECTED");
        dailyTaskMapper.updateById(task);

        TaskCheckinEntity checkin = new TaskCheckinEntity();
        checkin.setDailyTaskId(dto.getId());
        checkin.setUserId(SecurityUtils.getCurrentUserId());
        checkin.setAction("REJECT");
        checkin.setRemark(dto.getReason());
        checkin.setPhotoUrls(List.of());
        taskCheckinMapper.insert(checkin);
    }

    public List<DailyTaskEntity> getConfirmList() {
        Long familyId = SecurityUtils.getCurrentFamilyId();
        LocalDate today = LocalDate.now();
        var wrapper = new LambdaQueryWrapper<DailyTaskEntity>()
                .eq(DailyTaskEntity::getFamilyId, familyId)
                .eq(DailyTaskEntity::getTaskDate, today)
                .eq(DailyTaskEntity::getStatus, "COMPLETED");
        List<DailyTaskEntity> tasks = dailyTaskMapper.selectList(wrapper);
        return tasks;
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
