package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.service.ICompanyService;
import com.berksozcu.service.IOpeningVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

//Şirket oluştururken oluştucak şemayı ve kopyalancak tabloları oluşturduğumuz sınıf
@Service
@Transactional
public class CompanyServiceImpl implements ICompanyService {
    @Autowired
    private DataSource dataSource;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createNewTenantSchema(String schemaName, String companyName, String description, String sourceSchema) throws SQLException {
        if (!schemaName.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Geçersiz şema ismi!");
        }
        if (companyRepository.existsBySchemaName(schemaName))
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_KODU_MEVCUT));

        String finalSource = checkSchemaExists(sourceSchema) ? sourceSchema : "logo";


        //Kopyalanacak Tablolar
        String[] allTables = {"customer", "material", "material_price_history"
                , "payment_company", "purchase_invoice", "purchase_invoice_item", "received_collection",
                "sales_invoice", "sales_invoice_item", "app_user", "payroll", "currency_rate",
                "opening_voucher", "company"};

        List<String> tablesWithData = List.of("customer", "material", "app_user", "currency_rate", "company",
                "material_price_history");
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);

            try (Statement statement = connection.createStatement()) {
                // 1. Şemayı oluştur
                statement.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);

                // 2. Tabloları oluştur
                for (String tableName : allTables) {
                    statement.execute(String.format(
                            "CREATE TABLE %s.%s (LIKE %s.%s INCLUDING ALL)",
                            schemaName, tableName, finalSource, tableName
                    ));
                    if (tablesWithData.contains(tableName)) {
                        statement.execute(String.format(
                                "INSERT INTO %s.%s SELECT * FROM %s.%s",
                                schemaName, tableName, finalSource, tableName
                        ));
                        updateSequence(statement, schemaName, tableName);
                    }
                }

                connection.commit();

                Company company = new Company();
                company.setName(companyName);
                company.setSchemaName(schemaName);
                company.setDescription(description);

                companyRepository.save(company);
            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }
        }
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }


    @EventListener(ApplicationReadyEvent.class)
    protected void createDefaultCompany() {
        if (!companyRepository.existsBySchemaName("logo")) {
            Company defaultCompany = new Company();
            defaultCompany.setName("Ana Şirket (Varsayılan)");
            defaultCompany.setSchemaName("logo");
            defaultCompany.setDescription("Sistem ana şeması");
            companyRepository.save(defaultCompany);
        }
    }

    private void updateSequence(Statement statement, String schemaName, String tableName) throws SQLException {
        String sql = String.format(
                "SELECT setval(pg_get_serial_sequence('%s.%s', 'id'), coalesce(max(id), 1)) FROM %s.%s",
                schemaName, tableName, schemaName, tableName
        );
        statement.execute(sql);
    }

    private boolean checkSchemaExists(String schemaName) throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            var rs = conn.getMetaData().getSchemas(null, schemaName);
            return rs.next();
        }
    }


}

