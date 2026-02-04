package com.berksozcu.controller.impl;

import com.berksozcu.controller.IUserController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.user.DtoUser;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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


    @GetMapping("/me")
    public ResponseEntity<DtoUser> me(Authentication authentication) {
        if (authentication == null ||
                !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                new DtoUser(
                        user.getId(),
                        user.getUsername()
                )
        );
    }

}
