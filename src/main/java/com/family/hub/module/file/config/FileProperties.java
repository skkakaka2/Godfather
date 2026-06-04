package com.family.hub.module.file.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "file")
public class FileProperties implements InitializingBean {

    public static final String PUBLIC_URL_PREFIX = "/uploads";

    @NotBlank
    private String uploadPath = "./uploads";

    public Path getUploadRootPath() {
        return Path.of(uploadPath).toAbsolutePath().normalize();
    }

    @Override
    public void afterPropertiesSet() {
        try {
            Files.createDirectories(getUploadRootPath());
        } catch (IOException e) {
            throw new UncheckedIOException("初始化上传目录失败: " + getUploadRootPath(), e);
        }
    }
}
