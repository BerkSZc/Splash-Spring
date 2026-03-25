package com.berksozcu.controller.base;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RootEntity<T> {
    private Boolean result;

    private String errorMessage;

    private T data;


    public static <T> RootEntity<T> ok(T data) {
        RootEntity<T> rootEntity = new RootEntity<>();
        rootEntity.setResult(true);
        rootEntity.setErrorMessage(null);
        rootEntity.setData(data);
        return rootEntity;
    }

    public static <T> RootEntity<T> error(String errorMessage) {
        RootEntity<T> rootEntity = new RootEntity<>();
        rootEntity.setResult(false);
        rootEntity.setErrorMessage(errorMessage);
        rootEntity.setData(null);
        return rootEntity;
    }

    public static <T>RootEntity<List<T>> list(List<T> data) {
        RootEntity<List<T>> rootEntity = new RootEntity<>();
        rootEntity.setResult(true);
        rootEntity.setErrorMessage(null);
        rootEntity.setData(data);
        return rootEntity;
    }

    public static <T>RootEntity<Page<T>> page(Page<T> data) {
        RootEntity<Page<T>> rootEntity = new RootEntity<>();
        rootEntity.setResult(true);
        rootEntity.setErrorMessage(null);
        rootEntity.setData(data);
        return rootEntity;
    }

}
