package com.family.hub.module.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.hub.module.auth.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserMapper extends BaseMapper<UserEntity> {
    @Update("UPDATE user SET points = points + #{points} WHERE id = #{userId}")
    public int addPoints(@Param("userId") Long userId, @Param("points") Integer points);
}
