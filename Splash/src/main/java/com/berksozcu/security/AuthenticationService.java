package com.berksozcu.security;

import com.berksozcu.dto.company.CompanyDto;
import com.berksozcu.dto.user.AuthDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Map;
import java.util.Objects;

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
    public UserResponse signUp(AuthDto request) throws SQLException {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BaseException(new ErrorMessage(MessageType.KULLANICI_MEVCUT));
        }

        if (request.getPassword().length() < 8) {
            throw new BaseException(new ErrorMessage(MessageType.SIFRE_HATA));
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.saveAndFlush(newUser);

        String schemaName = companyService.createDefaultSchemaName();

        CompanyDto companyDto = new CompanyDto();
        companyDto.setSchemaName(schemaName);
        companyDto.setName(Objects.requireNonNullElse(request.getCompanyName(), "").toUpperCase());
        companyDto.setCompanyAddress(Objects.requireNonNullElse(request.getCompanyAddress(), "").toUpperCase());
        companyDto.setVdNo(request.getVdNo());
        companyDto.setInvoiceDescription(Objects.requireNonNullElse(request.getInvoiceDescription(), "").toUpperCase());

        CompanyDto newCompany = companyService.createNewTenantSchema(
                companyDto,
                "splash",
                newUser
        );

        Year initalYear = yearRepository.findFirstByCompanyIdOrderByYearValueDesc(newCompany.getId())
                        .orElseThrow(()  -> new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL)));

        newUser.setLastLoggedCompanyId(newCompany.getId());
        newUser.setLastLoggedYearId(initalYear.getId());

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser, Map.of("schemaName", schemaName,
                "year", initalYear.getYearValue()));

        return UserResponse.builder()
                .token(token)
                .schemaName(schemaName)
                .companyId(newCompany.getId())
                .yearId(initalYear.getId())
                .yearValue(initalYear.getYearValue())
                .build();
    }


    public UserResponse login(AuthDto user) {
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

        Company company;

        if (newUser.getLastLoggedCompanyId() != null) {
            company = companyRepository.findById(newUser.getLastLoggedCompanyId())
                    .orElseGet(() -> companyRepository.findFirstByUserIdOrderByIdDesc(newUser.getId())
                            .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI))));
        } else {
            company = companyRepository.findFirstByUserIdOrderByIdDesc(newUser.getId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI)));

            newUser.setLastLoggedCompanyId(company.getId());
        }

        Year activeYear = null;
        if (newUser.getLastLoggedYearId() != null) {
            activeYear = yearRepository.findByIdAndCompanyId(newUser.getLastLoggedYearId(), company.getId())
                    .orElse(null);
        }

        if (activeYear == null) {
            activeYear = yearRepository.findFirstByCompanyIdOrderByYearValueDesc(company.getId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL)));

            newUser.setLastLoggedYearId(activeYear.getId());
        }
        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser, Map.of("schemaName", company.getSchemaName(),
                "year", activeYear.getYearValue()));

        return UserResponse.builder()
                .token(token)
                .schemaName(company.getSchemaName())
                .companyId(company.getId())
                .yearId(activeYear.getId())
                .yearValue(activeYear.getYearValue())
                .build();
    }

    public UserResponse switchCompany(Long companyId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Company newCompany = companyRepository.findByIdAndUserId(companyId, currentUser.getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI)));

        Year latestYear = yearRepository.findFirstByCompanyIdOrderByYearValueDesc(newCompany.getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL)));

        currentUser.setLastLoggedCompanyId(newCompany.getId());
        currentUser.setLastLoggedYearId(latestYear.getId());
        userRepository.save(currentUser);

        String newToken = jwtService.generateToken(currentUser, Map.of("schemaName", newCompany.getSchemaName(),
                "year", latestYear.getYearValue()));

        return UserResponse.builder()
                .token(newToken)
                .schemaName(newCompany.getSchemaName())
                .companyId(newCompany.getId())
                .yearId(latestYear.getId())
                .yearValue(latestYear.getYearValue())
                .build();
    }

        @Transactional
        public UserResponse switchYear(Long yearId) {
            User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            Year selectedYear = yearRepository.findById(yearId)
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL)));

            if (!selectedYear.getCompany().getId().equals(currentUser.getLastLoggedCompanyId())) {
                throw new BaseException(new ErrorMessage(MessageType.SIRKET_YIL_MEVCUT_DEGIL));
            }

            currentUser.setLastLoggedYearId(selectedYear.getId());
            userRepository.save(currentUser);

            Company company = selectedYear.getCompany();

            String newToken = jwtService.generateToken(currentUser, Map.of(
                    "schemaName", company.getSchemaName(),
                    "year", selectedYear.getYearValue()
            ));

            return UserResponse.builder()
                    .token(newToken)
                    .schemaName(company.getSchemaName())
                    .companyId(company.getId())
                    .yearId(selectedYear.getId())
                    .yearValue(selectedYear.getYearValue())
                    .build();
        }
}
