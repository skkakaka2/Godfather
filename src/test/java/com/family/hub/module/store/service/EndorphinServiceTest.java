package com.family.hub.module.store.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.family.hub.common.exception.BizException;
import com.family.hub.module.auth.entity.UserEntity;
import com.family.hub.module.auth.mapper.UserMapper;
import com.family.hub.module.store.entity.EndorphinLogEntity;
import com.family.hub.module.store.mapper.EndorphinLogMapper;

@ExtendWith(MockitoExtension.class)
class EndorphinServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private EndorphinLogMapper endorphinLogMapper;

    @Mock
    private PointLogService pointLogService;

    @InjectMocks
    private EndorphinService endorphinService;

    @Test
    void exchangeDeductsEndorphinsAndAddsDopaminePoints() {
        Long familyId = 1L;
        Long userId = 2L;
        UserEntity user = new UserEntity();
        user.setEndorphins(1);

        when(userMapper.subtractEndorphins(userId, 3)).thenReturn(1);
        when(userMapper.selectById(userId)).thenReturn(user);

        endorphinService.exchange(familyId, userId, 3);

        verify(userMapper).addPoints(userId, 300);
        verify(pointLogService).record(familyId, userId, "ENDORPHIN_EXCHANGE", 300, null,
                "内啡肽兑换多巴胺：3 滴");

        ArgumentCaptor<EndorphinLogEntity> logCaptor = ArgumentCaptor.forClass(EndorphinLogEntity.class);
        verify(endorphinLogMapper).insert(logCaptor.capture());
        EndorphinLogEntity log = logCaptor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(familyId, log.getFamilyId());
        org.junit.jupiter.api.Assertions.assertEquals(userId, log.getUserId());
        org.junit.jupiter.api.Assertions.assertEquals("EXCHANGE", log.getType());
        org.junit.jupiter.api.Assertions.assertEquals(-3, log.getAmount());
        org.junit.jupiter.api.Assertions.assertEquals(1, log.getBalanceAfter());
    }

    @Test
    void exchangeRejectsWhenEndorphinsAreInsufficient() {
        when(userMapper.subtractEndorphins(2L, 3)).thenReturn(0);

        assertThrows(BizException.class, () -> endorphinService.exchange(1L, 2L, 3));

        verify(userMapper, never()).addPoints(any(), any());
        verifyNoInteractions(endorphinLogMapper, pointLogService);
    }

    @Test
    void exchangeRejectsWhenPointAmountOverflows() {
        assertThrows(BizException.class, () -> endorphinService.exchange(1L, 2L, Integer.MAX_VALUE));

        verify(userMapper, never()).subtractEndorphins(any(), any());
        verify(userMapper, never()).addPoints(any(), any());
        verifyNoInteractions(endorphinLogMapper, pointLogService);
    }
}
