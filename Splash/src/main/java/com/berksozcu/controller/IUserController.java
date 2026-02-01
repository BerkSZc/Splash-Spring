package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import org.springframework.web.bind.annotation.RequestBody;

public interface IUserController {
    public RootEntity<UserResponse> signUp(@RequestBody User user);
    public RootEntity<UserResponse> login(@RequestBody User user);
}
