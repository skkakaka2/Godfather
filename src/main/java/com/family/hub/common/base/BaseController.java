package com.family.hub.common.base;

import com.family.hub.security.LoginUser;
import com.family.hub.common.utils.SecurityUtils;

import org.springframework.stereotype.Component;

@Component
public class BaseController {

    protected LoginUser getCurrentUser() {
        return SecurityUtils.getCurrentUser();
    }

    protected Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    protected Long getCurrentFamilyId() {
        return SecurityUtils.getCurrentFamilyId();
    }
}
