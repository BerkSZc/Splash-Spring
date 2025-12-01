package com.berksozcu.handler;

import com.berksozcu.exception.BaseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<String>> handleBaseException(BaseException ex, WebRequest request) {
        return ResponseEntity.ok(createApiError(ex.getMessage(), request));
    }



    private <T>ApiResponse<T> createApiError(T message, WebRequest request) {
        ApiResponse<T> apiResponse = new ApiResponse<>();
        Exception<T> exception = new Exception<>();
        apiResponse.setStatus(HttpStatus.BAD_REQUEST.value());
        exception.setCreateTime(new Date());
        exception.setMessage(message);
        exception.setPath(request.getDescription(false));
        exception.setHostName(getHostName());
        apiResponse.setException(exception);

        return apiResponse;
    }

    private String getHostName() {
        try{
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
        return null;
    }


}
