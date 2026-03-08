//package com.berksozcu.starter;
//
//import com.berksozcu.configuration.CurrentTenantIdentifierResolverImpl;
//import com.berksozcu.configuration.MultiTenantConnectionProviderImpl;
//import dev.webview.Webview;
//import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.autoconfigure.domain.EntityScan;
//import org.springframework.boot.builder.SpringApplicationBuilder;
//import org.springframework.context.ConfigurableApplicationContext;
//import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
//
//import java.awt.EventQueue;
//
//@SpringBootApplication
//@EntityScan(basePackages = "com.berksozcu")
//@RegisterReflectionForBinding(
//        classes = {
//                com.berksozcu.entites.user.User.class,
//                com.berksozcu.entites.customer.Customer.class,
//                CurrentTenantIdentifierResolverImpl.class,
//                MultiTenantConnectionProviderImpl.class,
//                org.hibernate.bytecode.internal.bytebuddy.BytecodeProviderImpl.class,
//                org.hibernate.bytecode.internal.none.BytecodeProviderImpl.class,
//        }
//)
//@EnableJpaRepositories(basePackages = "com.berksozcu.repository")
//public class DesktopApp {
//
//    private static final String START_URL = "http://localhost:8080";
//
//    public static void main(String[] args) {
//        System.setProperty("hibernate.bytecode.provider", "none");
//        System.setProperty("hibernate.bytecode.use_reflection_optimizer", "false");
//
//        ConfigurableApplicationContext ctx = new SpringApplicationBuilder(DesktopApp.class)
//                .headless(false)
//                .run(args);
//
//        EventQueue.invokeLater(() -> {
//            try {
//                Webview wv = new Webview(true);
//                wv.setTitle("App");
//                wv.setSize(1280, 800);
//                wv.loadURL(START_URL);
//                wv.run();
//
//                ctx.close();
//                System.exit(0);
//            } catch (Exception e) {
//                e.printStackTrace();
//                ctx.close();
//            }
//        });
//    }
//}