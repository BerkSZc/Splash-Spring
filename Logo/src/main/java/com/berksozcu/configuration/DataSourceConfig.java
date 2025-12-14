package com.berksozcu.configuration;

import com.berksozcu.context.TenantContext;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        Map<Object, Object> targetDataSources = new HashMap<>();

        DataSource aDataSource = DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/postgres")
                .username("postgres")
                .password("1")
                .driverClassName("org.postgresql.Driver")
                .build();

        DataSource bDataSource = DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/postgres2")
                .username("postgres")
                .password("1")
                .driverClassName("org.postgresql.Driver")
                .build();

        targetDataSources.put("A", aDataSource);
        targetDataSources.put("B", bDataSource);

        //Hangi veritabanına bağlanacağını çalışma zamanında belirleyen bir yapıyı ifade eder.
        AbstractRoutingDataSource routingDataSource = new AbstractRoutingDataSource() {
            @Override
            //O an hangi veri kaynağını kullanacağımızı belirtir
            protected Object determineCurrentLookupKey() {
                // BU meto sayesinde mevcut tenant yani kullanıcıyı belirleriz
                return TenantContext.getCurrentTenant();
            }
        };

        routingDataSource.setTargetDataSources(targetDataSources);
        // eğer determine metodu null dönerse default olarak hangisi seçilmeli onu belirleriz
        routingDataSource.setDefaultTargetDataSource(aDataSource);
        //Gerekli ayarlar için kullanılır
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }
}

