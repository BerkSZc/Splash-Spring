package com.berksozcu.starter;

import com.berksozcu.entites.customer.Customer;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"com.berksozcu"})
@EntityScan(basePackages = {"com.berksozcu"})
@ComponentScan(basePackages = {"com.berksozcu"})
@ConfigurationPropertiesScan(basePackages = {"com.berksozcu"})
public class LogoApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogoApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.typeMap(Customer.class, Customer.class).addMappings(
                m -> {
                    m.skip(Customer::setId);
                }
        );

        return modelMapper;
    }

}
