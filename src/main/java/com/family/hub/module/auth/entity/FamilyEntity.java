package com.family.hub.module.auth.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
@TableName("family")
public class FamilyEntity extends BaseEntity {

    private String name;
    private String inviteCode;
    private Integer status;
}
