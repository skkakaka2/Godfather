package com.family.hub.module.auth.controller;

import com.family.hub.common.base.BaseController;
import com.family.hub.common.result.R;
import com.family.hub.module.auth.dto.ChangePasswordRequest;
import com.family.hub.module.auth.enums.RoleEnum;
import com.family.hub.module.auth.service.UserService;
import com.family.hub.module.auth.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户信息、家庭成员接口")
public class UserController extends BaseController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息")
    public R<UserVO> me() {
        return R.ok(userService.getCurrentUserInfo());
    }

    @GetMapping("/family/members")
    @Operation(summary = "获取家庭成员列表")
    public R<List<UserVO>> getFamilyMembers() {
        return R.ok(userService.getFamilyMembers());
    }

    @PutMapping("/me/password")
    @Operation(summary = "修改当前用户密码")
    public R<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changeCurrentUserPassword(request.getCurrentPassword(), request.getNewPassword());
        return R.ok();
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新用户信息")
    public R<UserVO> updateUser(@PathVariable Long id,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String avatar,
            @RequestParam("role") RoleEnum role) {
        return R.ok(userService.updateUserInfo(id, nickname, avatar, role));
    }
}
