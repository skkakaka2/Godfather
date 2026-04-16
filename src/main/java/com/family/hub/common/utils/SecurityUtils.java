package com.family.hub.common.utils;

import com.family.hub.common.exception.BizException;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.security.LoginUser;

import lombok.NoArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@NoArgsConstructor
public final class SecurityUtils {

    public static LoginUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser)) {
            throw new BizException(ResultCode.UNAUTHORIZED);
        }
        return (LoginUser) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public static Long getCurrentFamilyId() {
        return getCurrentUser().getFamilyId();
    }
}
