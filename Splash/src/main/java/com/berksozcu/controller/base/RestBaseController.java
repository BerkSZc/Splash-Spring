package com.berksozcu.controller.base;

import org.springframework.data.domain.Page;

import java.util.List;

public class RestBaseController {


    public <T>RootEntity<T> ok(T data) {
        return RootEntity.ok(data);
    }

    public <T>RootEntity<T> error(String errorMessage) {
        return RootEntity.error(errorMessage);
    }


    public <T>RootEntity<List<T>> listOk(List<T> data) {
        return RootEntity.list(data);
    }

    public <T>RootEntity<Page<T>> pageOk(Page<T> data) {
        return RootEntity.page(data);
    }
}