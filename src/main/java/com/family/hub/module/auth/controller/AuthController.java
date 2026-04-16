package com.family.hub.module.auth.controller;

import com.family.hub.common.base.BaseController;
import com.family.hub.common.result.R;
import com.family.hub.module.auth.dto.LoginRequest;
import com.family.hub.module.auth.dto.RegisterRequest;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.auth.vo.LoginVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "登录、注册接口")
public class AuthController extends BaseController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "登录")
    public R<LoginVO> login(@RequestBody @Valid LoginRequest request) {
        return success(userService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "注册")
    public R<LoginVO> register(@RequestBody @Valid RegisterRequest request) {
        return success(userService.register(request));
    }
}
