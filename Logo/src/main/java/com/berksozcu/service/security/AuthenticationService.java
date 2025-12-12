package com.berksozcu.service.security;

import com.berksozcu.entites.User;
import com.berksozcu.entites.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;



    public UserResponse signUp(User user) {
      Optional<User> existsUser = userRepository.findByUsername(user.getUsername());

      if(existsUser.isPresent()) {
         throw  new BaseException(new ErrorMessage(MessageType.KULLANICI_MEVCUT));
      }

      if(user.getPassword().length() < 8) {
          throw new BaseException(new ErrorMessage(MessageType.SIFRE_HATA));
      }


        User newUser = User.builder().username(user.getUsername()).password(
                passwordEncoder.encode(user.getPassword()))
                .build();
        userRepository.save(newUser);
        var token = jwtService.generateToken(newUser);

        return UserResponse.builder().token(token).build();
    }


    public UserResponse login(User user) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                user.getUsername(), user.getPassword()
        ));
        User newUser = userRepository.findByUsername(user.getUsername()).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.KULLANICI_BULUNAMADI))
        );
        String token = jwtService.generateToken(newUser);
        return UserResponse.builder().token(token).build();
    }
}
