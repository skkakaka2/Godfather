package com.family.hub.module.auth.enums;

public enum RoleEnum {
    ADMIN("ADMIN"),
    PARENT("PARENT"),
    CHILD("CHILD");

    private final String value;

    RoleEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
