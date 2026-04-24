package com.family.hub.module.store.controller;

import com.family.hub.common.result.R;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.store.dto.RedeemOrderCreateDTO;
import com.family.hub.module.store.service.PointLogService;
import com.family.hub.module.store.service.RedeemOrderService;
import com.family.hub.module.store.vo.PointLogVO;
import com.family.hub.module.store.vo.RedeemOrderVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
@Tag(name = "积分与兑换", description = "积分查询、流水记录、兑换订单管理")
public class RedeemOrderController {

    private final RedeemOrderService redeemOrderService;
    private final PointLogService pointLogService;

    @PostMapping("/redeem")
    @Operation(summary = "申请兑换")
    public R<RedeemOrderVO> create(@RequestBody @Valid RedeemOrderCreateDTO dto) {
        return R.ok(redeemOrderService.create(dto));
    }

    @GetMapping("/redeem/orders")
    @Operation(summary = "查询兑换订单列表")
    public R<List<RedeemOrderVO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status) {
        return R.ok(redeemOrderService.list(userId, status));
    }

    @PostMapping("/redeem/{id}/approve")
    @Operation(summary = "审批通过")
    public R<Void> approve(@PathVariable Long id) {
        redeemOrderService.approve(id);
        return R.ok();
    }

    @PostMapping("/redeem/{id}/reject")
    @Operation(summary = "审批拒绝")
    public R<Void> reject(@PathVariable Long id) {
        redeemOrderService.reject(id);
        return R.ok();
    }

    @GetMapping("/points/balance")
    @Operation(summary = "查询当前用户积分余额")
    public R<Integer> getBalance() {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.ok(pointLogService.getBalance(userId));
    }

    @GetMapping("/points/logs")
    @Operation(summary = "查询积分流水")
    public R<List<PointLogVO>> getPointLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type) {
        Long queryUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        return R.ok(pointLogService.listByUser(queryUserId, type));
    }
}
