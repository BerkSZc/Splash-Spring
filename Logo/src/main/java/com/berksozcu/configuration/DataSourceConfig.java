package com.berksozcu.configuration;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
       return DataSourceBuilder.create()
               .url("jdbc:postgresql://localhost:5432/postgres")
               .username("postgres")
               .password("Avengers.52")
               .driverClassName("org.postgresql.Driver")
               .build();
    }
}

