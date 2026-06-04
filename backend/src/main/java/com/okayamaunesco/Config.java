package com.okayamaunesco;

public class Config {
    public static final String DB_URL = getenv("DB_URL", "jdbc:mysql://localhost:3306/okayama_unesco?useSSL=false&serverTimezone=Asia/Tokyo&characterEncoding=utf8");
    public static final String DB_USER = getenv("DB_USER", "root");
    public static final String DB_PASSWORD = getenv("DB_PASSWORD", "");
    public static final int SERVER_PORT = Integer.parseInt(getenv("SERVER_PORT", "8080"));

    private static String getenv(String key, String defaultValue) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? defaultValue : value;
    } 
}
