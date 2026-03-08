package com.berksozcu.security;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.UserRepository;
import com.berksozcu.repository.YearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
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

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private YearRepository yearRepository;

    public UserResponse signUp(User user, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        if(company == null){
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI));
        }

        if(!yearRepository.existsByCompanyId(company.getId())){
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL));
        }

      Optional<User> existsUser = userRepository.findByUsernameAndCompany(
              user.getUsername(),
              company);

      if(existsUser.isPresent()) {
         throw  new BaseException(new ErrorMessage(MessageType.KULLANICI_MEVCUT));
      }
      if(user.getPassword().length() < 8) {
          throw new BaseException(new ErrorMessage(MessageType.SIFRE_HATA));
      }

        User newUser = User.builder().username(user.getUsername()).password(
                passwordEncoder.encode(user.getPassword()))
                .company(company)
                .build();
        userRepository.save(newUser);
        var token = jwtService.generateToken(newUser);

        return UserResponse.builder().token(token).build();
    }


    public UserResponse login(User user, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        if(company == null) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI));
        }

        if(!yearRepository.existsByCompanyId(company.getId())){
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL));
        }

        User newUser = userRepository.findByUsernameAndCompany(
                user.getUsername(),
                company).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.KULLANICI_BULUNAMADI))
        );

        if(!Objects.equals(company.getId(), newUser.getCompany().getId())) {
            throw new BaseException(new ErrorMessage(MessageType.KULLANICI_SIRKET_HATA));
        }

        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    user.getUsername(), user.getPassword()
            ));
        } catch(BadCredentialsException e) {
            throw new BaseException(new ErrorMessage(MessageType.YANLIS_SIFRE));
        }

        String token = jwtService.generateToken(newUser);
        return UserResponse.builder().token(token).build();
    }
}
