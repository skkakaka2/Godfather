package com.family.hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class FamilyHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FamilyHubApplication.class, args);
    }
}
