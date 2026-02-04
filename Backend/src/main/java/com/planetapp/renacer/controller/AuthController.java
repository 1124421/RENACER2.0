package com.planetapp.renacer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para endpoints de autenticación
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Endpoint para verificar si el usuario está autenticado
     * Útil para el frontend para validar credenciales
     */
    @GetMapping(value = "/check", produces = "application/json")
    public ResponseEntity<Map<String, Object>> checkAuth(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            response.put("authenticated", true);
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .toList());
        } else {
            response.put("authenticated", false);
        }
        
        return ResponseEntity.ok(response);
    }
}

