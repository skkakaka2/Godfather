package com.family.hub.common.base;

import com.family.hub.security.LoginUser;
import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.result.PageResult;
import com.family.hub.common.result.R;
import com.family.hub.common.utils.SecurityUtils;

import java.util.ArrayList;
import java.util.List;

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

    public <T> R<T> success(T data) {
        return R.ok(data);
    }

    public <T> R<T> error(ResultCode resultCode) {
        return R.fail(resultCode);
    }

    public <T> R<PageResult<T>> successForPage(ArrayList<T> list, long total, int page, int pageSize) {
        var pageResult = new PageResult<>(list, total, page, pageSize);
        return R.ok(pageResult);
    }
}
