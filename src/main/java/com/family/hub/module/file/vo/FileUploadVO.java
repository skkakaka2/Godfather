package com.family.hub.module.file.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileUploadVO {

    private String fileName;
    private String originalName;
    private String url;
    private long size;
    private String contentType;
}
