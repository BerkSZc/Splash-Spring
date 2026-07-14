package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.controller.IUserController;
import com.berksozcu.controller.base.RootEntity;
import com.berksozcu.dto.user.AuthDto;
import com.berksozcu.dto.user.UserDto;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.security.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

import static com.berksozcu.controller.base.RootEntity.ok;

@RestController
@RequestMapping("/rest/api/auth")

public class UserControllerImpl implements IUserController {
    @Autowired
    private AuthenticationService authenticationService;

    @Override
    @PostMapping("/save")
    @RateLimit(capacity = 5)
    public RootEntity<UserResponse> signUp(@RequestBody AuthDto request) throws SQLException {
        return ok(authenticationService.signUp(request));
    }

    @Override
    @PostMapping("/login")
    @RateLimit(capacity = 5)
    public RootEntity<UserResponse> login( @RequestBody AuthDto user){
        return ok(authenticationService.login(user));
    }


    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        if (authentication == null ||
                !(authentication.getPrincipal() instanceof User user)) {
            throw new BaseException(new ErrorMessage(MessageType.OTURUM_SURE_DOLDU));
        }

        return ResponseEntity.ok(
                new UserDto(
                        user.getId(),
                        user.getUsername()
                )
        );
    }

}
