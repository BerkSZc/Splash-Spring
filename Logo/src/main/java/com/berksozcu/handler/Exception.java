package com.berksozcu.handler;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Exception<T> {
    private T message;

    private String path;

    private String hostName;

    private Date createTime;
}
