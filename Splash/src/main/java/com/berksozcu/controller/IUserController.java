package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;

public interface IUserController {
     RootEntity<UserResponse> signUp(User user, String schemaName);
     RootEntity<UserResponse> login(User user, String schemaName);
}
