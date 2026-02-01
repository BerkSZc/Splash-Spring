package com.berksozcu.service;

import com.berksozcu.entites.user.User;

import java.util.Optional;

public interface IUserService {
Optional<User> findByUsername(String username);
}
