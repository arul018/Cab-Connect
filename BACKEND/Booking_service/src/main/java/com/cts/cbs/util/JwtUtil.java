package com.cts.cbs.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    // Proper JWT validation - validates signature and expiration
    public boolean isValidToken(String token) {
        try {
            System.out.println("Validating token: " + (token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null"));
            
            // Check if token exists
            if (token == null || token.trim().isEmpty()) {
                System.out.println("Token is null or empty");
                return false;
            }
            
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
                System.out.println("Removed Bearer prefix");
            }
            
            // Validate token signature and expiration
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
                
            System.out.println("Token validation successful");
            return true;
        } catch (Exception e) {
            System.out.println("Token validation failed: " + e.getMessage());
            return false; // Invalid token
        }
    }
    
    // Extract username from token
    public String extractUsername(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}