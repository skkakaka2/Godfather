package com.family.hub;

import java.time.LocalDateTime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@EnableScheduling
@SpringBootApplication
public class FamilyHubApplication {

    public static void main(String[] args) {

        log.info("Application started at {}", LocalDateTime.now());

        SpringApplication.run(FamilyHubApplication.class, args);
    }
}
