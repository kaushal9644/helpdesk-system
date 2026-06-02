package com.helpdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.helpdesk.config.CorsProperties;
import com.helpdesk.config.JwtProperties;
import com.helpdesk.config.StorageProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableConfigurationProperties({
        JwtProperties.class,
        CorsProperties.class,
        StorageProperties.class
})
@EnableScheduling
public class BackendApplication {



public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}