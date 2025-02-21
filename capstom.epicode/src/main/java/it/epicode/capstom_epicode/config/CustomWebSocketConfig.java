package it.epicode.capstom_epicode.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.*;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Configuration
@EnableWebSocket
public class CustomWebSocketConfig implements WebSocketConfigurer {

    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new WebSocketHandler() {
                    @Override
                    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                        sessions.add(session);
                    }

                    @Override
                    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws IOException {
                        String payload = message.getPayload().toString();

                        try {
                            ObjectMapper objectMapper = new ObjectMapper();
                            JsonNode jsonNode = objectMapper.readTree(payload);

                            if (jsonNode.has("type") && jsonNode.get("type").asText().equals("subscribe")) {
                                Long mentorId = jsonNode.get("mentorId").asLong();

                                session.getAttributes().put("mentorId", mentorId);

                            } else {
                                Long targetMentorId = jsonNode.has("mentorId") ? jsonNode.get("mentorId").asLong() : null;

                                if (targetMentorId != null) {

                                    for (WebSocketSession s : sessions) {
                                        if (s.isOpen() && s.getAttributes().get("mentorId") != null) {
                                            Long sessionMentorId = (Long) s.getAttributes().get("mentorId");

                                            if (sessionMentorId.equals(targetMentorId)) {
                                                String notificationMessage = "{\"type\": \"notification\", \"content\": \"" + payload + "\"}";
                                                s.sendMessage(new TextMessage(notificationMessage));
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("Errore nel parsing del messaggio: " + e.getMessage());
                        }
                    }



                    @Override
                    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
                        System.err.println(" Errore WebSocket: " + exception.getMessage());
                    }

                    @Override
                    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                        sessions.remove(session);
                        System.out.println(" WebSocket chiuso: " + session.getId());
                    }

                    @Override
                    public boolean supportsPartialMessages() {
                        return false;
                    }
                }, "/ws")
                .setAllowedOrigins("*");
    }
}
