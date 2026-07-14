package com.berksozcu.controller;

import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.user.AuthDto;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;

import java.sql.SQLException;

public interface IUserController {
     RootEntity<UserResponse> signUp(AuthDto request) throws SQLException;
     RootEntity<UserResponse> login(AuthDto user);
}
