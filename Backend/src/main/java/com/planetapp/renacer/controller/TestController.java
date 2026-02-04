package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador de prueba para verificar usuarios en la base de datos
 * Útil para debugging - debería eliminarse en producción
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public TestController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/usuarios")
    public Map<String, Object> listarUsuarios() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // findAll() ahora usa @EntityGraph para cargar los roles correctamente
            var usuarios = usuarioRepository.findAll();
            response.put("total", usuarios.size());
            response.put("usuarios", usuarios.stream().map(u -> {
                Map<String, Object> usuarioInfo = new HashMap<>();
                usuarioInfo.put("id", u.getIdUsuario());
                usuarioInfo.put("username", u.getUsername());
                usuarioInfo.put("nombreUsuario", u.getNombreUsuario());
                usuarioInfo.put("activo", u.getActivo());
                usuarioInfo.put("rol", u.getRol() != null ? u.getRol().getNombre() : "Sin rol");
                usuarioInfo.put("passwordHash", u.getPasswordHash() != null ? "***" + u.getPasswordHash().substring(u.getPasswordHash().length() - 10) : "null");
                return usuarioInfo;
            }).toList());
            
            // Verificar usuario Brandon específicamente
            Optional<Usuario> brandon = usuarioRepository.findByUsername("Brandon");
            if (brandon.isPresent()) {
                Usuario b = brandon.get();
                boolean contrasenaCorrecta = passwordEncoder.matches("brandon256", b.getPasswordHash());
                response.put("brandonEncontrado", true);
                response.put("brandonActivo", b.getActivo());
                response.put("brandonRol", b.getRol() != null ? b.getRol().getNombre() : "Sin rol");
                response.put("contrasenaVerificada", contrasenaCorrecta);
            } else {
                response.put("brandonEncontrado", false);
            }
            
            response.put("error", null);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            response.put("stackTrace", e.getStackTrace());
        }
        
        return response;
    }
}

