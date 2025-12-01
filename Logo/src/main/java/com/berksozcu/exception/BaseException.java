package com.berksozcu.exception;

public class BaseException extends RuntimeException{
    public BaseException(ErrorMessage errorMessage) {
        super(errorMessage.prepareError());
    }
}
