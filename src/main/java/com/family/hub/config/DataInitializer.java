package com.family.hub.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.family.hub.module.auth.entity.Family;
import com.family.hub.module.auth.entity.User;
import com.family.hub.module.auth.mapper.FamilyMapper;
import com.family.hub.module.auth.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserMapper userMapper;
    private final FamilyMapper familyMapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-username}")
    private String adminUsername;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Value("${app.seed.family-name}")
    private String familyName;

    @Override
    public void run(ApplicationArguments args) {
        initAdmin();
    }

    private void initAdmin() {
        Long adminCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getRole, "ADMIN"));
        if (adminCount > 0) {
            log.info("管理员账户已存在，跳过种子数据初始化");
            return;
        }

        Family family = new Family();
        family.setName(familyName);
        family.setInviteCode(generateInviteCode());
        family.setStatus(1);
        familyMapper.insert(family);

        User admin = new User();
        admin.setFamilyId(family.getId());
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setNickname("管理员");
        admin.setRole("ADMIN");
        admin.setStatus(1);
        userMapper.insert(admin);

        log.info("种子数据初始化完成 — 家庭: {}, 管理员: {}", familyName, adminUsername);
    }

    private String generateInviteCode() {
        return cn.hutool.core.util.IdUtil.fastSimpleUUID().substring(0, 8).toUpperCase();
    }
}
