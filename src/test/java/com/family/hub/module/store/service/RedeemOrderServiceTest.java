package com.family.hub.module.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.family.hub.common.exception.BizException;
import com.family.hub.module.activity.service.ActivityService;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.auth.vo.UserVO;
import com.family.hub.module.store.dto.RedeemOrderCreateDTO;
import com.family.hub.module.store.entity.RedeemOrderEntity;
import com.family.hub.module.store.entity.RewardEntity;
import com.family.hub.module.store.mapper.RedeemOrderMapper;
import com.family.hub.module.store.mapper.RewardMapper;
import com.family.hub.security.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RedeemOrderServiceTest {

    @Mock
    private RedeemOrderMapper redeemOrderMapper;

    @Mock
    private RewardMapper rewardMapper;

    @Mock
    private UserService userService;

    @Mock
    private PointLogService pointLogService;

    @Mock
    private ActivityService activityService;

    private RedeemOrderService redeemOrderService;

    @BeforeEach
    void setUp() {
        redeemOrderService = new RedeemOrderService(
                redeemOrderMapper, rewardMapper, userService, pointLogService, activityService);
        ReflectionTestUtils.setField(redeemOrderService, "winterStartMonth", "01");
        ReflectionTestUtils.setField(redeemOrderService, "winterStartDay", "01");
        ReflectionTestUtils.setField(redeemOrderService, "winterEndMonth", "12");
        ReflectionTestUtils.setField(redeemOrderService, "winterEndDay", "31");
        ReflectionTestUtils.setField(redeemOrderService, "summerStartMonth", "07");
        ReflectionTestUtils.setField(redeemOrderService, "summerStartDay", "01");
        ReflectionTestUtils.setField(redeemOrderService, "summerEndMonth", "08");
        ReflectionTestUtils.setField(redeemOrderService, "summerEndDay", "31");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createNormalRewardGeneratesPendingRedeemCode() {
        loginAs(2L, 1L, "CHILD");
        RewardEntity reward = reward(10L, 1L, "周末电影", 50, -1);
        RedeemOrderCreateDTO dto = new RedeemOrderCreateDTO();
        dto.setRewardId(10L);

        when(rewardMapper.selectById(10L)).thenReturn(reward);
        when(activityService.getActiveDiscountRate(1L)).thenReturn(null);
        when(userService.subtractPoints(2L, 50)).thenReturn(1);
        when(redeemOrderMapper.insert(any(RedeemOrderEntity.class))).thenAnswer(invocation -> {
            RedeemOrderEntity order = invocation.getArgument(0);
            order.setId(100L);
            return 1;
        });

        var result = redeemOrderService.create(dto);

        ArgumentCaptor<RedeemOrderEntity> captor = ArgumentCaptor.forClass(RedeemOrderEntity.class);
        verify(redeemOrderMapper).insert(captor.capture());
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(captor.getValue().getStatus()).isEqualTo("PENDING");
        assertThat(captor.getValue().getRedeemCode()).isNotBlank();
    }

    @Test
    void ownerCanGetQrPayloadForPendingOrder() {
        loginAs(2L, 1L, "CHILD");
        RedeemOrderEntity order = pendingOrder();
        when(redeemOrderMapper.selectById(100L)).thenReturn(order);
        when(rewardMapper.selectById(10L)).thenReturn(reward(10L, 1L, "周末电影", 50, -1));

        var qr = redeemOrderService.getQrPayload(100L);

        assertThat(qr.getOrderId()).isEqualTo(100L);
        assertThat(qr.getPayload()).isEqualTo("familyhub://redeem-confirm?code=abc123");
        assertThat(qr.getRewardName()).isEqualTo("周末电影");
    }

    @Test
    void childCannotPreviewScanCode() {
        loginAs(2L, 1L, "CHILD");

        assertThatThrownBy(() -> redeemOrderService.previewScan("abc123"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("只有家长可以扫码确认兑换");
    }

    @Test
    void parentConfirmScanChangesPendingOrderToConfirmed() {
        loginAs(3L, 1L, "PARENT");
        RedeemOrderEntity order = pendingOrder();
        when(redeemOrderMapper.selectOne(any())).thenReturn(order);
        when(redeemOrderMapper.updateById(order)).thenReturn(1);
        when(rewardMapper.selectById(10L)).thenReturn(reward(10L, 1L, "周末电影", 50, -1));
        when(userService.getFamilyMembers()).thenReturn(
                java.util.List.of(UserVO.builder().id(2L).nickname("小明").build()));

        var result = redeemOrderService.confirmScan("abc123");

        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        assertThat(result.getUserNickname()).isEqualTo("小明");
        assertThat(order.getStatus()).isEqualTo("CONFIRMED");
        assertThat(order.getConfirmedBy()).isEqualTo(3L);
        assertThat(order.getConfirmedAt()).isNotNull();
        verify(pointLogService).record(1L, 2L, "REDEEM", -50, 100L, "扫码确认兑换");
    }

    @Test
    void ownerCanCancelPendingOrderAndRestorePointsAndStock() {
        loginAs(2L, 1L, "CHILD");
        RedeemOrderEntity order = pendingOrder();
        RewardEntity reward = reward(10L, 1L, "周末电影", 50, 1);
        when(redeemOrderMapper.selectById(100L)).thenReturn(order);
        when(redeemOrderMapper.updateById(order)).thenReturn(1);
        when(rewardMapper.selectById(10L)).thenReturn(reward);

        redeemOrderService.cancel(100L);

        assertThat(order.getStatus()).isEqualTo("CANCELLED");
        assertThat(order.getCanceledAt()).isNotNull();
        assertThat(reward.getStock()).isEqualTo(2);
        verify(userService).addPoints(2L, 50);
        verify(pointLogService).record(1L, 2L, "UNFREEZE", 50, 100L, "取消兑换，积分解冻退还");
        verify(rewardMapper).updateById(reward);
    }

    @Test
    void legacyApproveAndRejectAreDisabled() {
        loginAs(3L, 1L, "PARENT");

        assertThatThrownBy(() -> redeemOrderService.approve(100L))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("兑换审核已停用");
        assertThatThrownBy(() -> redeemOrderService.reject(100L))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("兑换审核已停用");
    }

    private void loginAs(Long userId, Long familyId, String role) {
        LoginUser user = new LoginUser(userId, familyId, "user" + userId, "", role);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private RedeemOrderEntity pendingOrder() {
        RedeemOrderEntity order = new RedeemOrderEntity();
        order.setId(100L);
        order.setFamilyId(1L);
        order.setUserId(2L);
        order.setRewardId(10L);
        order.setPointsCost(50);
        order.setStatus("PENDING");
        order.setRedeemCode("abc123");
        return order;
    }

    private RewardEntity reward(Long id, Long familyId, String name, int pointsPrice, int stock) {
        RewardEntity reward = new RewardEntity();
        reward.setId(id);
        reward.setFamilyId(familyId);
        reward.setName(name);
        reward.setPointsPrice(pointsPrice);
        reward.setStock(stock);
        reward.setStatus("ON");
        return reward;
    }
}
