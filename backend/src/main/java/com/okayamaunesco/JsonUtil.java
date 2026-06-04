package com.okayamaunesco;

import java.util.HashMap;
import java.util.Map;

public class JsonUtil {
    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null) return map;
        String body = json.trim();
        if (body.startsWith("{")) body = body.substring(1);
        if (body.endsWith("}")) body = body.substring(0, body.length() - 1);

        String[] parts = body.split(",(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
        for (String part : parts) {
            String[] kv = part.split(":", 2);
            if (kv.length == 2) {
                String key = clean(kv[0]);
                String value = clean(kv[1]);
                map.put(key, value);
            }
        }
        return map;
    }

    private static String clean(String text) {
        text = text.trim();
        if (text.startsWith("\"") && text.endsWith("\"")) {
            text = text.substring(1, text.length() - 1);
        }
        return text.replace("\\\"", "\"").replace("\\n", "\n");
    }

    public static String escape(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    public static String userJson(User user) {
        return "{\"id\":" + user.getId() +
                ",\"name\":\"" + escape(user.getName()) + "\"" +
                ",\"email\":\"" + escape(user.getEmail()) + "\"" +
                ",\"role\":\"" + escape(user.getRole()) + "\"}";
    }
}
