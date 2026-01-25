package com.berksozcu.handler;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    private Integer status;

    private Exception<T> exception;
}
