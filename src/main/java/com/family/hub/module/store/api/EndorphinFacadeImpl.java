package com.family.hub.module.store.api;

import org.springframework.stereotype.Component;

import com.family.hub.module.store.service.EndorphinService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EndorphinFacadeImpl implements EndorphinFacade {

    private final EndorphinService endorphinService;

    @Override
    public void addEndorphins(Long familyId, Long userId, int amount, Long refId, String remark) {
        endorphinService.addEndorphins(familyId, userId, amount, refId, remark);
    }
}
