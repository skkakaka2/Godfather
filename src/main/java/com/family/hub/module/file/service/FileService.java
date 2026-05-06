package com.family.hub.module.file.service;

import com.family.hub.common.enums.ResultCode;
import com.family.hub.common.exception.BizException;
import com.family.hub.module.file.config.FileProperties;
import com.family.hub.module.file.vo.FileUploadVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE,
            "image/webp");
    private static final DateTimeFormatter DATE_PATH_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final FileProperties fileProperties;

    public FileUploadVO uploadImage(MultipartFile file) {
        validateImage(file);

        String originalName = extractOriginalName(file);
        String extension = getExtension(originalName);
        String storedFileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        String datePath = LocalDate.now().format(DATE_PATH_FORMATTER);
        Path targetDirectory = fileProperties.getUploadRootPath().resolve(datePath);
        Path targetFile = targetDirectory.resolve(storedFileName);

        try {
            Files.createDirectories(targetDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("保存上传文件失败: originalName={}, targetFile={}", originalName, targetFile, e);
            throw new BizException(ResultCode.INTERNAL_ERROR, "图片上传失败");
        }

        String relativePath = datePath + "/" + storedFileName;
        return FileUploadVO.builder()
                .fileName(storedFileName)
                .originalName(originalName)
                .url(FileProperties.PUBLIC_URL_PREFIX + "/" + relativePath)
                .size(file.getSize())
                .contentType(normalizeContentType(file.getContentType()))
                .build();
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException(ResultCode.BAD_REQUEST, "上传文件不能为空");
        }

        String originalName = extractOriginalName(file);
        String extension = getExtension(originalName);
        String contentType = normalizeContentType(file.getContentType());

        if (!ALLOWED_EXTENSIONS.contains(extension) || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BizException(ResultCode.BAD_REQUEST, "仅支持 jpg/jpeg/png/webp/gif 图片上传");
        }
    }

    private String extractOriginalName(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            throw new BizException(ResultCode.BAD_REQUEST, "文件名不能为空");
        }

        String cleanPath = StringUtils.cleanPath(originalFilename);
        Path path = Path.of(cleanPath).getFileName();
        if (path == null || !StringUtils.hasText(path.toString())) {
            throw new BizException(ResultCode.BAD_REQUEST, "文件名不能为空");
        }
        return path.toString();
    }

    private String getExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        if (!StringUtils.hasText(extension)) {
            throw new BizException(ResultCode.BAD_REQUEST, "文件扩展名不能为空");
        }
        return extension.toLowerCase(Locale.ROOT);
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
    }
}
