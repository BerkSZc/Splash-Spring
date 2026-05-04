package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.user.SignUpRequest;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;

import java.sql.SQLException;

public interface IUserController {
     RootEntity<UserResponse> signUp(SignUpRequest request) throws SQLException;
     RootEntity<UserResponse> login(User user);
}
