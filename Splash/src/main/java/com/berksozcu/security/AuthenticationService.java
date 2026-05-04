package com.berksozcu.security;

import com.berksozcu.dto.user.SignUpRequest;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.user.User;
import com.berksozcu.entites.user.UserResponse;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.UserRepository;
import com.berksozcu.repository.YearRepository;
import com.berksozcu.service.ICompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Map;

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

    @Autowired
    private ICompanyService companyService;

    @Transactional(rollbackFor = Exception.class)
    public UserResponse signUp(SignUpRequest request) throws SQLException {

        if(userRepository.findByUsername(request.getUsername()).isPresent()){
            throw new BaseException(new ErrorMessage(MessageType.KULLANICI_MEVCUT));
        }

        if(request.getPassword().length() < 8){
            throw new BaseException(new ErrorMessage(MessageType.SIFRE_HATA));
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.saveAndFlush(newUser);

        String schemaName = companyService.createDefaultSchemaName();

        companyService.createNewTenantSchema(
                schemaName,
                request.getCompanyName(),
                request.getDescription(),
                "splash",
                newUser
        );

        String token = jwtService.generateToken(newUser, Map.of("schemaName", schemaName));

        return UserResponse.builder().token(token).schemaName(schemaName).build();
    }


    public UserResponse login(User user) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    user.getUsername(), user.getPassword()
            ));
        } catch (BadCredentialsException e) {
            throw new BaseException(new ErrorMessage(MessageType.YANLIS_SIFRE));
        }

        User newUser = userRepository.findByUsername(
                user.getUsername()).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.KULLANICI_BULUNAMADI))
        );

        Company company = companyRepository.findFirstByUserIdOrderByIdDesc(newUser.getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI)));

        if (!yearRepository.existsByCompanyId(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL));
        }

        String token = jwtService.generateToken(newUser, Map.of("schemaName", company.getSchemaName()));
        return UserResponse.builder().token(token).
        schemaName(company.getSchemaName()).
        build();
    }
}
