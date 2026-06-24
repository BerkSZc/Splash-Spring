package com.berksozcu.configuration;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

        if(!(handler instanceof HandlerMethod handlerMethod)) return true;

        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

        if(rateLimit == null){
            rateLimit = handlerMethod.getBeanType().getAnnotation(RateLimit.class);
        }

        if(rateLimit == null) return true;

        final RateLimit finalRateLimit = rateLimit;

        String ip = request.getRemoteAddr();
        String key = ip + ":" + handlerMethod.getBeanType().getSimpleName() + ":" + handlerMethod.getMethod().getName();


        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(finalRateLimit));

        if(bucket.tryConsume(rateLimit.cost())) {
            return true;
        } else {
            throw new BaseException(new ErrorMessage(MessageType.ISTEK_FAZLALALIGI));
        }
    }

    private Bucket createBucket(RateLimit rateLimit) {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(rateLimit.capacity())
                        .refillIntervally(rateLimit.capacity(), Duration.ofMinutes(rateLimit.period())))
                .build();
    }

}
