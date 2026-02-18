package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.ICompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

//Şirket oluştururken oluştucak şemayı ve kopyalancak tabloları oluşturduğumuz sınıf
@Service
@Transactional
public class CompanyServiceImpl implements ICompanyService {
    @Autowired
    private DataSource dataSource;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private YearRepository yearRepository;

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private PurchaseInvoiceItemRepository purchaseInvoiceItemRepository;

    @Autowired
    private SalesInvoiceItemRepository salesInvoiceItemRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createNewTenantSchema(String schemaName, String companyName, String description, String sourceSchema) throws SQLException {
        if (!schemaName.matches("^[a-zA-Z0-9_]+$")) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_ISIM_HATA));
        }
        if (companyRepository.existsBySchemaName(schemaName))
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_KODU_MEVCUT));

        String finalSource = checkSchemaExists(sourceSchema) ? sourceSchema : "splash";

        //Kopyalanacak Tablolar
        String[] allTables = {"customer", "material", "app_user",
                "purchase_invoice", "purchase_invoice_item", "sales_invoice", "sales_invoice_item",
                "material_price_history", "received_collection",
                "payment_company", "payroll", "opening_voucher"};

        List<String> tablesWithData = List.of("app_user");
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

    @Override
    public List<Year> getYearsByCompany(Long companyId) {
        return yearRepository.findByCompanyIdOrderByYearValueDesc(companyId);
    }

    @Transactional
    @Override
    public Year addYearToCompany(Long companyId, Integer year) {
        if (yearRepository.existsByYearValueAndCompanyId(year, companyId)) {
            throw new BaseException(new ErrorMessage(MessageType.MALI_YIL_MEVCUT));
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI)));

        Year newYear = new Year();
        newYear.setCompany(company);
        newYear.setYearValue(year);
        return yearRepository.save(newYear);
    }

    @Transactional
    @Override
    public void deleteCompanyAndYear(Long companyId, Integer year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        purchaseInvoiceItemRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);
        purchaseInvoiceRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);

        salesInvoiceItemRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);
        salesInvoiceRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);
        payrollRepository.deleteByCompanyIdAndTransactionDateBetween(companyId, start, end);
        receivedCollectionRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);
        paymentCompanyRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);
        openingVoucherRepository.deleteByCompanyIdAndDateBetween(companyId, start, end);

        yearRepository.deleteYearValueByCompanyId(year, companyId);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(0)
    @Transactional
    protected void createDefaultCompany() throws SQLException {
        String defaultSchema = "splash";

        try {
            Integer schemaCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.schemata WHERE schema_name = ?",
                    Integer.class, defaultSchema);

            if (schemaCount == null || schemaCount == 0) {
                try (Connection connection = dataSource.getConnection()) {
                    connection.setAutoCommit(true);

                    try (Statement stmt = connection.createStatement()) {
                        stmt.execute("CREATE SCHEMA IF NOT EXISTS " + defaultSchema);
                        stmt.execute("SET search_path TO " + defaultSchema);

                        ClassPathResource resource = new ClassPathResource("init.sql");
                        ScriptUtils.executeSqlScript(connection, resource);

                        stmt.execute(String.format(
                                "INSERT INTO %s.company (name, schema_name, description) VALUES ('Ana Şirket', 'splash', 'Varsayılan')",
                                defaultSchema));

                        System.out.println(">>> Varsayılan şema (splash) ve tablolar kuruldu.");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Sema Kurulum Hatasi: " + e.getMessage());
            // Uygulamanın kurları çekmeye çalışıp patlamasını engellemek için burada durdurabilirsin
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void setDynamicSearchPath() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.schemata WHERE schema_name = 'splash'",
                    Integer.class);

            if (count != null && count > 0) {
                jdbcTemplate.execute("SET search_path TO splash, public");
                System.out.println(">>> Arama yolu 'splash' olarak ayarlandı.");
            } else {
                // Yoksa sadece public
                jdbcTemplate.execute("SET search_path TO public");
                System.out.println(">>> splash bulunamadı, varsayılan 'public' kullanılıyor.");
            }
        } catch (Exception e) {
            // Hata durumunda güvenli liman: public
            jdbcTemplate.execute("SET search_path TO public");
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

