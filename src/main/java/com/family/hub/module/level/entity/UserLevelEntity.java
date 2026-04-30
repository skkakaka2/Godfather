package com.family.hub.module.level.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.family.hub.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user_level")
public class UserLevelEntity extends BaseEntity {

    private Long familyId;

    private Long userId;

    /** 总等级 1-30 */
    private Integer totalLevel;

    /** 当前大等级 1-10 */
    private Integer level;

    /** 当前小阶段 1-低等 2-中等 3-高等 */
    private Integer subLevel;

    /** 累计经验 */
    private Integer exp;
}
