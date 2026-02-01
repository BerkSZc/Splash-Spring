package com.berksozcu.configuration;

import org.hibernate.engine.jdbc.connections.spi.AbstractMultiTenantConnectionProvider;
import org.hibernate.engine.jdbc.connections.spi.ConnectionProvider;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public class MultiTenantConnectionProviderImpl extends AbstractMultiTenantConnectionProvider {

    private final DataSource dataSource;

    // Spring, DataSource'u buraya otomatik olarak enjekte eder.
    // ApplicationContext ile uğraşmanıza gerek yok.
    public MultiTenantConnectionProviderImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    protected ConnectionProvider getAnyConnectionProvider() {
        // "logo" veya varsayılan şemayı döndürür
        return new ConnectionProviderImpl(dataSource);
    }

    @Override
    protected ConnectionProvider selectConnectionProvider(Object tenantIdentifier) {
        return new ConnectionProviderImpl(dataSource);
    }

    @Override
    public Connection getConnection(Object tenantIdentifier) throws SQLException {
        Connection connection = dataSource.getConnection();
        try (Statement statement = connection.createStatement()) {
            String schema = "logo";

            if (tenantIdentifier != null) {
                boolean exists = connection.getMetaData().getSchemas(null, tenantIdentifier.toString()).next();
                if (exists) {
                    schema = tenantIdentifier.toString();
                }
            }
            statement.execute("SET search_path TO " + schema);
        } catch (SQLException e) {
            connection.close(); // Hata durumunda bağlantıyı kapatmayı unutma
            throw e;
        }
        return connection;
    }

    @Override
    public void releaseConnection(Object tenantIdentifier, Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            // Bağlantı havuza dönmeden önce şemayı sıfırla
            statement.execute("SET search_path TO logo");
        }
        connection.close();
    }

    // Hibernate'in ihtiyaç duyduğu iç yardımcı sınıf
    private static class ConnectionProviderImpl implements ConnectionProvider {
        private final DataSource dataSource;

        public ConnectionProviderImpl(DataSource dataSource) {
            this.dataSource = dataSource;
        }

        @Override
        public Connection getConnection() throws SQLException {
            return dataSource.getConnection();
        }

        @Override
        public void closeConnection(Connection conn) throws SQLException {
            conn.close();
        }

        @Override
        public boolean supportsAggressiveRelease() {
            return false;
        }

        @Override
        public boolean isUnwrappableAs(Class unwrapType) {
            return false;
        }

        @Override
        public <T> T unwrap(Class<T> unwrapType) {
            return null;
        }
    }
}