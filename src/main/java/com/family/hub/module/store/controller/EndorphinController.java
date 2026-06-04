package com.family.hub.module.store.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.family.hub.common.result.PageResult;
import com.family.hub.common.result.R;
import com.family.hub.common.utils.SecurityUtils;
import com.family.hub.module.store.dto.EndorphinExchangeDTO;
import com.family.hub.module.store.service.EndorphinService;
import com.family.hub.module.store.vo.EndorphinLogVO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/store/endorphins")
@RequiredArgsConstructor
@Tag(name = "内啡肽账户", description = "内啡肽余额、流水和兑换")
public class EndorphinController {

    private final EndorphinService endorphinService;

    @GetMapping("/balance")
    @Operation(summary = "查询当前用户内啡肽余额")
    public R<Integer> getBalance() {
        return R.ok(endorphinService.getBalance(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/logs")
    @Operation(summary = "查询内啡肽流水")
    public R<PageResult<EndorphinLogVO>> getLogs(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return R.ok(endorphinService.listCurrentUserLogs(type, page, pageSize));
    }

    @PostMapping("/exchange")
    @Operation(summary = "内啡肽兑换多巴胺")
    public R<Void> exchange(@RequestBody @Valid EndorphinExchangeDTO dto) {
        endorphinService.exchangeCurrentUser(dto.getAmount());
        return R.ok();
    }
}
