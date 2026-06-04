package com.okayamaunesco;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static class Session {
        User user;
        LocalDateTime createdAt;

        Session(User user) {
            this.user = user;
            this.createdAt = LocalDateTime.now();
        }
    }

    private static final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public static String createSession(User user) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, new Session(user));
        return token;
    }

    public static User getUser(String token) {
        if (token == null || token.isBlank()) return null;
        Session session = sessions.get(token);
        return session == null ? null : session.user;
    }

    public static void removeSession(String token) {
        if (token != null) sessions.remove(token);
    }
}
