package com.berksozcu.interceptor;

import com.berksozcu.tenant.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Override
    //Bu metod, HTTP isteği controller’a ulaşmadan önce çalışır.
    //Tenant bilgisini kontrolü sağlanır.
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenant = request.getHeader("X-Tenant-ID");
        if (tenant != null) {
            TenantContext.setCurrentTenant(tenant);
        }
        return true;
    }

    @Override
    //Bu metod, HTTP isteği tamamlandıktan sonra çalışır.
    //Thread de saklanan tenant bilgisini temizler.
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }

}
