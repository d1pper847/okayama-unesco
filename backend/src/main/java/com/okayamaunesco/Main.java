package com.okayamaunesco;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

public class Main {

    private static final Logger LOG = Logger.getLogger(Main.class.getName());
    private static final AuthService  AUTH_SERVICE = new AuthService();
    private static final ContactDAO   CONTACT_DAO  = new ContactDAO();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(Config.SERVER_PORT), 0);
        server.setExecutor(Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 2));

        server.createContext("/api/health", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            boolean dbOk = Database.testConnection();
            sendJson(exchange, 200,
                "{\"status\":\"OK\",\"backend\":\"running\",\"database\":\""
                + (dbOk ? "connected" : "not connected") + "\"}");
        });


        server.createContext("/api/languages", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                sendJson(exchange, 405, "{\"message\":\"GET only\"}");
                return;
            }
            sendJson(exchange, 200, "{\"languages\":" + SupportedLanguages.JSON + "}");
        });

        server.createContext("/api/register", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!isPost(exchange)) return;

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                User user  = AUTH_SERVICE.register(data.get("name"), data.get("email"), data.get("password"));
                String token = SessionManager.createSession(user);
                sendJson(exchange, 201,
                    "{\"message\":\"Account created successfully.\",\"token\":\"" + token
                    + "\",\"user\":" + JsonUtil.userJson(user) + "}");
            } catch (IllegalArgumentException e) {
                sendJson(exchange, 400, "{\"message\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            } catch (Exception e) {
                LOG.severe("Register error: " + e.getMessage());
                sendJson(exchange, 500, "{\"message\":\"An internal error occurred. Please try again.\"}");
            }
        });

        server.createContext("/api/login", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!isPost(exchange)) return;

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                User user  = AUTH_SERVICE.login(data.get("email"), data.get("password"));
                String token = SessionManager.createSession(user);
                sendJson(exchange, 200,
                    "{\"message\":\"Login successful.\",\"token\":\"" + token
                    + "\",\"user\":" + JsonUtil.userJson(user) + "}");
            } catch (IllegalArgumentException e) {
                sendJson(exchange, 401, "{\"message\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            } catch (Exception e) {
                LOG.severe("Login error: " + e.getMessage());
                sendJson(exchange, 500, "{\"message\":\"An internal error occurred. Please try again.\"}");
            }
        });

        server.createContext("/api/me", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                sendJson(exchange, 405, "{\"message\":\"GET only\"}");
                return;
            }

            User user = SessionManager.getUser(getBearerToken(exchange));
            if (user == null) {
                sendJson(exchange, 401, "{\"message\":\"Not logged in.\"}");
                return;
            }
            sendJson(exchange, 200, "{\"user\":" + JsonUtil.userJson(user) + "}");
        });

        server.createContext("/api/logout", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!isPost(exchange)) return;
            SessionManager.removeSession(getBearerToken(exchange));
            sendJson(exchange, 200, "{\"message\":\"Logout successful.\"}");
        });

        server.createContext("/api/contact", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!isPost(exchange)) return;

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                String name    = data.get("name");
                String email   = data.get("email");
                String subject = data.getOrDefault("subject", "");
                String message = data.get("message");

                if (isBlank(name) || isBlank(email) || isBlank(message)) {
                    sendJson(exchange, 400, "{\"message\":\"Name, email, and message are required.\"}");
                    return;
                }
                 if (name.length() > 100 || email.length() > 255 || subject.length() > 255 || message.length() > 5000) {
                    sendJson(exchange, 400, "{\"message\":\"Input exceeds maximum allowed length.\"}");
                    return;
                }

                CONTACT_DAO.saveMessage(name.trim(), email.trim(), subject.trim(), message.trim());
                sendJson(exchange, 201, "{\"message\":\"Message received. Thank you!\"}");
            } catch (Exception e) {
                LOG.severe("Contact error: " + e.getMessage());
                sendJson(exchange, 500, "{\"message\":\"An internal error occurred. Please try again.\"}");
            }
        });

        server.start();
        LOG.info("Okayama UNESCO backend started on port " + Config.SERVER_PORT);
        LOG.info("Database: " + (Database.testConnection() ? "connected" : "NOT connected – check MySQL and schema.sql"));
    }

    private static String getBearerToken(HttpExchange exchange) {
        String auth = exchange.getRequestHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        return auth.substring("Bearer ".length()).trim();
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static boolean isPost(HttpExchange exchange) throws IOException {
        if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            sendJson(exchange, 405, "{\"message\":\"POST only\"}");
            return false;
        }
        return true;
    }

    private static boolean handleOptions(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            sendJson(exchange, 200, "{}");
            return true;
        }
        return false;
    }

    private static void addCors(HttpExchange exchange) {
        var headers = exchange.getResponseHeaders();
        headers.add("Access-Control-Allow-Origin",  Config.CORS_ORIGIN);
        headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJson(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
