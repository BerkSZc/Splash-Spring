package com.berksozcu.service;

import com.berksozcu.entites.User;

import java.util.Optional;

public interface IUserService {
Optional<User> findByUsername(String username);
}
