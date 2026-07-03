package com.okayamaunesco;

import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.SQLException;
import java.util.regex.Pattern;

public class AuthService {

    private static final int    MIN_PASSWORD_LENGTH = 8;   // raised from 4
    private static final int    MAX_PASSWORD_LENGTH = 128;
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final UserDAO userDAO = new UserDAO();

    public User register(String name, String email, String password) throws SQLException {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Name is required.");
        if (name.trim().length() > 100)
            throw new IllegalArgumentException("Name must be 100 characters or fewer.");
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("Email is required.");
        if (!EMAIL_PATTERN.matcher(email.trim()).matches())
            throw new IllegalArgumentException("Please enter a valid email address.");
        if (password == null || password.length() < MIN_PASSWORD_LENGTH)
            throw new IllegalArgumentException(
                "Password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        if (password.length() > MAX_PASSWORD_LENGTH)
            throw new IllegalArgumentException("Password is too long.");

        String normEmail = email.trim().toLowerCase();
        String normName  = name.trim();

        try {
            userDAO.createUser(normName, normEmail, PasswordUtil.hash(password));
        } catch (SQLIntegrityConstraintViolationException e) {
            throw new IllegalArgumentException(
                "Registration failed. If this email is already registered, please log in.");
        }

        return userDAO.findByEmail(normEmail);
    }

    public User login(String email, String password) throws SQLException {
        if (email == null || email.isBlank() || password == null || password.isBlank())
            throw new IllegalArgumentException("Email and password are required.");

        User user = userDAO.findByEmail(email.trim().toLowerCase());

        boolean matches = (user != null) && PasswordUtil.verify(password, user.getPasswordHash());
        if (!matches)
            throw new IllegalArgumentException("Email or password is incorrect.");

        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("pbkdf2:")) {
            userDAO.updatePasswordHash(user.getId(), PasswordUtil.hash(password));
        }

        return user;
    }
}
