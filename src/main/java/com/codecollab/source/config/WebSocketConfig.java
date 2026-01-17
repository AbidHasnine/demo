package com.codecollab.source.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for Real-Time Communication
 * 
 * This class configures STOMP (Simple Text Oriented Messaging Protocol) over WebSocket
 * for real-time features like chat messaging and code synchronization.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker options
     * - /topic: Used for broadcasting messages to all subscribers (pub-sub model)
     * - /app: Prefix for messages bound for @MessageMapping-annotated methods
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to carry messages back to the client
        // on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic");
        
        // Designate the "/app" prefix for messages that are bound for methods
        // annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Register STOMP endpoints
     * - Clients will connect to this endpoint to establish WebSocket connection
     * - SockJS fallback options are enabled for browsers that don't support WebSocket
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint for WebSocket connections
        // withSockJS() enables SockJS fallback options
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
