package com.family.hub.module.level.api;

import org.springframework.stereotype.Component;

import com.family.hub.module.level.entity.LevelConfigEntity;
import com.family.hub.module.level.service.ExperienceService;
import com.family.hub.module.level.service.PrivilegeService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LevelFacadeImpl implements LevelFacade {

    private final ExperienceService experienceService;
    private final PrivilegeService privilegeService;

    @Override
    public LevelConfigDTO getCurrentConfig(Long familyId, Long userId) {
        LevelConfigEntity config = experienceService.getCurrentConfig(familyId, userId);
        return new LevelConfigDTO(
                config != null && config.getBonusPercent() != null ? config.getBonusPercent() : 0);
    }

    @Override
    public boolean isDoubleCardActive(Long familyId, Long userId) {
        return privilegeService.isDoubleCardActive(familyId, userId);
    }

    @Override
    public void addExperience(Long familyId, Long userId, int amount, String source, Long refId, String remark) {
        experienceService.addExperience(familyId, userId, amount, source, refId, remark);
    }
}
