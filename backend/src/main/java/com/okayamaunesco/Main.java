package com.okayamaunesco;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class Main {
    private static final AuthService authService = new AuthService();
    private static final ContactDAO contactDAO = new ContactDAO();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(Config.SERVER_PORT), 0);

        server.createContext("/api/health", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            boolean dbOk = Database.testConnection();
            String response = "{\"status\":\"OK\",\"backend\":\"running\",\"version\":\"V19\",\"database\":\"" + (dbOk ? "connected" : "not connected") + "\"}";
            sendJson(exchange, 200, response);
        });

        server.createContext("/api/register", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendJson(exchange, 405, "{\"message\":\"POST only\"}");
                return;
            }

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                User user = authService.register(data.get("name"), data.get("email"), data.get("password"));
                String token = SessionManager.createSession(user);
                sendJson(exchange, 201, "{\"message\":\"Account created successfully.\",\"token\":\"" + token + "\",\"user\":" + JsonUtil.userJson(user) + "}");
            } catch (IllegalArgumentException e) {
                sendJson(exchange, 400, "{\"message\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            } catch (Exception e) {
                sendJson(exchange, 500, "{\"message\":\"Database error. Please check MySQL and schema.sql.\",\"detail\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            }
        });

        server.createContext("/api/login", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendJson(exchange, 405, "{\"message\":\"POST only\"}");
                return;
            }

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                User user = authService.login(data.get("email"), data.get("password"));
                String token = SessionManager.createSession(user);
                sendJson(exchange, 200, "{\"message\":\"Login successful.\",\"token\":\"" + token + "\",\"user\":" + JsonUtil.userJson(user) + "}");
            } catch (IllegalArgumentException e) {
                sendJson(exchange, 401, "{\"message\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            } catch (Exception e) {
                sendJson(exchange, 500, "{\"message\":\"Database error. Please check MySQL and schema.sql.\",\"detail\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
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
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendJson(exchange, 405, "{\"message\":\"POST only\"}");
                return;
            }

            SessionManager.removeSession(getBearerToken(exchange));
            sendJson(exchange, 200, "{\"message\":\"Logout successful.\"}");
        });



        server.createContext("/api/contact", exchange -> {
            addCors(exchange);
            if (handleOptions(exchange)) return;
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendJson(exchange, 405, "{\"message\":\"POST only\"}");
                return;
            }

            try {
                Map<String, String> data = JsonUtil.parseSimpleJson(readBody(exchange));
                String name = data.get("name");
                String email = data.get("email");
                String subject = data.getOrDefault("subject", "");
                String message = data.get("message");

                if (name == null || name.isBlank() || email == null || email.isBlank() || message == null || message.isBlank()) {
                    sendJson(exchange, 400, "{\"message\":\"Name, email, and message are required.\"}");
                    return;
                }

                contactDAO.saveMessage(name.trim(), email.trim(), subject.trim(), message.trim());
                sendJson(exchange, 201, "{\"message\":\"Message saved successfully.\"}");
            } catch (Exception e) {
                sendJson(exchange, 500, "{\"message\":\"Database error. Please check MySQL and schema.sql.\",\"detail\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
            }
        });

        server.setExecutor(null);
        server.start();
        System.out.println("Okayama UNESCO backend Final Version started at http://localhost:" + Config.SERVER_PORT);
        System.out.println("Database status: " + (Database.testConnection() ? "connected" : "not connected"));
    }

    private static String getBearerToken(HttpExchange exchange) {
        String auth = exchange.getRequestHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        return auth.substring("Bearer ".length()).trim();
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static boolean handleOptions(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            sendJson(exchange, 200, "{}");
            return true;
        }
        return false;
    }

    private static void addCors(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJson(HttpExchange exchange, int status, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
