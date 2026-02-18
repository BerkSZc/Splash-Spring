package com.berksozcu.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"com.berksozcu"})
@EntityScan(basePackages = {"com.berksozcu"})
@ComponentScan(basePackages = {"com.berksozcu"})
@ConfigurationPropertiesScan(basePackages = {"com.berksozcu"})
public class SplashApplication {

    public static void main(String[] args) {
        SpringApplication.run(SplashApplication.class, args);
    }
}
