package com.family.hub.module.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.hub.module.auth.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<UserEntity> {
}
