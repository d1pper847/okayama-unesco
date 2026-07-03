package com.okayamaunesco;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class SessionManager {

    private static final int SESSION_DURATION_HOURS = 8;
    private static final long SESSION_DURATION_SECONDS =
        TimeUnit.HOURS.toSeconds(SESSION_DURATION_HOURS);

    private static final class Session {
        final User user;
        volatile Instant expiresAt;

        Session(User user) {
            this.user = user;
            touch();
        }

        void touch() {
            this.expiresAt = Instant.now().plusSeconds(SESSION_DURATION_SECONDS);
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private static final Map<String, Session> SESSIONS = new ConcurrentHashMap<>();

    static {
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "session-cleanup");
            t.setDaemon(true);
            return t;
        });
        scheduler.scheduleAtFixedRate(SessionManager::removeExpiredSessions, 30, 30, TimeUnit.MINUTES);
    }

    public static String createSession(User user) {
        String token = UUID.randomUUID().toString();
        SESSIONS.put(token, new Session(user));
        return token;
    }

    public static User getUser(String token) {
        if (token == null || token.isBlank()) return null;
        Session session = SESSIONS.get(token);
        if (session == null || session.isExpired()) {
            SESSIONS.remove(token);
            return null;
        }
        session.touch();
        return session.user;
    }

    public static void removeSession(String token) {
        if (token != null) SESSIONS.remove(token);
    }

    private static void removeExpiredSessions() {
        Iterator<Map.Entry<String, Session>> it = SESSIONS.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue().isExpired()) it.remove();
        }
    }
}
