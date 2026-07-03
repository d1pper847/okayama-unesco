package com.okayamaunesco;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

public class PasswordUtil {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS   = 310_000;   // OWASP 2023 minimum
    private static final int KEY_LENGTH   = 256;        // bits
    private static final int SALT_BYTES   = 16;

    private static final SecureRandom RNG = new SecureRandom();

    public static String hash(String password) {
        byte[] salt = new byte[SALT_BYTES];
        RNG.nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt);
        return "pbkdf2:" + ITERATIONS + ":"
                + Base64.getEncoder().encodeToString(salt) + ":"
                + Base64.getEncoder().encodeToString(hash);
    }


    public static boolean verify(String password, String stored) {
        if (stored == null) return false;

        if (stored.startsWith("pbkdf2:")) {
            String[] parts = stored.split(":");
            if (parts.length != 4) return false;
            int iterations   = Integer.parseInt(parts[1]);
            byte[] salt      = Base64.getDecoder().decode(parts[2]);
            byte[] expected  = Base64.getDecoder().decode(parts[3]);
            byte[] actual    = pbkdf2(password.toCharArray(), salt, iterations);
            return constantTimeEquals(actual, expected);
        }

        return sha256Hex(password).equals(stored);
    }


    private static byte[] pbkdf2(char[] password, byte[] salt) {
        return pbkdf2(password, salt, ITERATIONS);
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = skf.generateSecret(spec).getEncoded();
            spec.clearPassword();
            return hash;
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Password hashing failed", e);
        }
    }

    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) return false;
        int diff = 0;
        for (int i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
        return diff == 0;
    }

    private static String sha256Hex(String password) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
