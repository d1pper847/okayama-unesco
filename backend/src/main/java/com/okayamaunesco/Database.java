package com.okayamaunesco;

import com.mysql.cj.jdbc.MysqlDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class Database {

    private static final DataSource DATA_SOURCE = buildDataSource();

    private static DataSource buildDataSource() {
        MysqlDataSource ds = new MysqlDataSource();
        ds.setUrl(Config.DB_URL);
        ds.setUser(Config.DB_USER);
        ds.setPassword(Config.DB_PASSWORD);
        return ds;
    }

    public static Connection getConnection() throws SQLException {
        return DATA_SOURCE.getConnection();
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            return true;
        } catch (SQLException e) {
            System.err.println("Database connection failed: " + e.getMessage());
            return false;
        }
    }
}
