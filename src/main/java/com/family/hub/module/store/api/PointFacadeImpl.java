package com.family.hub.module.store.api;

import org.springframework.stereotype.Component;

import com.family.hub.module.store.service.PointLogService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PointFacadeImpl implements PointFacade {

    private final PointLogService pointLogService;

    @Override
    public void record(Long familyId, Long userId, String type, int amount, Long refId, String remark) {
        pointLogService.record(familyId, userId, type, amount, refId, remark);
    }
}
