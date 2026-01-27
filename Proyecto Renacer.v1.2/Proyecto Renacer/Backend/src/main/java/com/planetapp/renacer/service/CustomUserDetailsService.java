package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Servicio personalizado para cargar usuarios desde la base de datos.
 * Reemplaza la autenticación en memoria por autenticación desde la BD.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

            // Verificar si el usuario está activo
            if (usuario.getActivo() == null || !usuario.getActivo()) {
                throw new UsernameNotFoundException("Usuario inactivo: " + username);
            }

            // Verificar que el usuario tenga un rol
            if (usuario.getRol() == null) {
                throw new UsernameNotFoundException("Usuario sin rol asignado: " + username);
            }

            // Obtener los roles/authorities del usuario
            Collection<GrantedAuthority> authorities = getAuthorities(usuario);
            
            // Verificar que haya al menos un authority
            if (authorities.isEmpty()) {
                throw new UsernameNotFoundException("Usuario sin permisos: " + username);
            }

            // Retornar UserDetails con la información del usuario
            return org.springframework.security.core.userdetails.User.builder()
                    .username(usuario.getUsername())
                    .password(usuario.getPasswordHash()) // El password ya está hasheado
                    .authorities(authorities)
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(!usuario.getActivo())
                    .build();
        } catch (UsernameNotFoundException e) {
            // Re-lanzar excepciones de usuario no encontrado
            throw e;
        } catch (Exception e) {
            // Capturar cualquier otro error y lanzar una excepción más descriptiva
            System.err.println("Error al cargar usuario '" + username + "': " + e.getMessage());
            e.printStackTrace();
            throw new UsernameNotFoundException("Error al cargar usuario: " + username, e);
        }
    }

    /**
     * Obtiene los authorities (roles) del usuario.
     * Convierte el nombre del rol a un formato que Spring Security entiende.
     */
    private Collection<GrantedAuthority> getAuthorities(Usuario usuario) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String roleName = usuario.getRol().getNombre();
            // Spring Security espera roles con prefijo "ROLE_"
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        }
        
        return authorities;
    }
}


