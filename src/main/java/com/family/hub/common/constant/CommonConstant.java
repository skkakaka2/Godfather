package com.family.hub.common.constant;

public final class CommonConstant {

    private CommonConstant() {
    }

    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    public static final String REDIS_KEY_PREFIX = "family-hub:";

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_PARENT = "PARENT";
    public static final String ROLE_CHILD = "CHILD";
}
