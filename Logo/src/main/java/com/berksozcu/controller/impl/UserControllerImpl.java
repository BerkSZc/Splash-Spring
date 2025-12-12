package com.berksozcu.controller.impl;

import com.berksozcu.controller.IUserController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.entites.User;
import com.berksozcu.entites.UserResponse;
import com.berksozcu.service.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import static com.berksozcu.controller.base.RootEntity.ok;

@RestController
@RequestMapping("/rest/api/auth")

public class UserControllerImpl implements IUserController {
    @Autowired
    private AuthenticationService authenticationService;

    @Override
    @PostMapping("/save")
    public RootEntity<UserResponse> signUp( @RequestBody User user){
        return ok(authenticationService.signUp(user));
    }

    @Override
    @PostMapping("/login")
    public RootEntity<UserResponse> login( @RequestBody User user){
        return ok(authenticationService.login(user));
    }
}
