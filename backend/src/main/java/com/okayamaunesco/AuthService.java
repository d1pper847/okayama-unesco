package com.okayamaunesco;

import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.SQLException;

public class AuthService {
    private final UserDAO userDAO = new UserDAO();

    public User register(String name, String email, String password) throws SQLException {
        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.length() < 4) {
            throw new IllegalArgumentException("Name, email, and password are required. Password must be at least 4 characters.");
        }

        try {
            userDAO.createUser(name.trim(), email.trim().toLowerCase(), PasswordUtil.hash(password));
        } catch (SQLIntegrityConstraintViolationException e) {
            throw new IllegalArgumentException("This email is already registered.");
        }

        return userDAO.findByEmail(email.trim().toLowerCase());
    }

    public User login(String email, String password) throws SQLException {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userDAO.findByEmail(email.trim().toLowerCase());
        if (user == null || !user.getPasswordHash().equals(PasswordUtil.hash(password))) {
            throw new IllegalArgumentException("Email or password is incorrect.");
        }
        return user;
    }
}
