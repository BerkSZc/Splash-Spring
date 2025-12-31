package com.berksozcu.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String tenantId = request.getHeader("X-Tenant-ID");

        if (tenantId != null && !tenantId.isEmpty()) {
            TenantContext.setCurrentTenant(tenantId);
        } else {
            // Header yoksa varsayılan olarak "logo" şemasını kullan
            TenantContext.setCurrentTenant("logo");
        }

        try {
            // İsteğin bir sonraki filtreye (JwtAuthenticationFilter gibi) geçmesini sağla
            filterChain.doFilter(request, response);
        } finally {
            // İstek bitince hafızayı temizle (Memory leak ve veri karışıklığını önler)
            TenantContext.clear();
        }
    }
}
