package com.berksozcu.configuration;

import com.berksozcu.interceptor.TenantInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{

    @Autowired
    private TenantInterceptor tenantInterceptor;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Override
    //Bu metod ile HTTP istekleri sırasında çalışacak interceptor eklenir.
    //Interceptor, Bir web isteği geldiğinde isteği işleyen metoda ulaşmadan önce kontrol yapmak için kullanılır.
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor);
    }
}