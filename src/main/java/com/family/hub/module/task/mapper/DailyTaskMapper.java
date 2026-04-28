package com.family.hub.module.task.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.hub.module.task.entity.DailyTaskEntity;

@Mapper
public interface DailyTaskMapper extends BaseMapper<DailyTaskEntity> {

    @Select("SELECT * FROM daily_task WHERE id = #{id} FOR UPDATE")
    public DailyTaskEntity selectForUpdate(Long id);
    
}
