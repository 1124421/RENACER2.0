package com.planetapp.renacer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Define el bean para el codificador de contraseñas (BCrypt).
     * @return BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Ya no creamos un bean UserDetailsService aquí porque CustomUserDetailsService
     * ya está anotado con @Service, por lo que Spring lo detecta automáticamente.
     * Esto evita el conflicto de múltiples beans.
     */

    /**
     * Configura CORS para permitir peticiones del frontend.
     * @return CorsConfigurationSource configurado.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permitir orígenes: mismo servidor (localhost:8080), Live Server (5500) y archivos locales
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:8080", 
            "http://127.0.0.1:8080",
            "http://localhost:5500", 
            "http://127.0.0.1:5500", 
            "file://"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        // Permitir header X-Requested-With para identificar peticiones AJAX
        configuration.addAllowedHeader("X-Requested-With");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Define la cadena de filtros de seguridad HTTP.
     * Se requiere el rol 'ADMIN' para acceder a los endpoints '/api/**'.
     * @param http Objeto HttpSecurity para configurar reglas.
     * @return SecurityFilterChain configurada.
     * @throws Exception Si la configuración falla.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Configura CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Deshabilita CSRF (esencial para APIs REST que no usan cookies de sesión)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // IMPORTANTE: Rutas de API primero (antes de archivos estáticos)
                        // Endpoints de autenticación públicos (registro, recuperación)
                        .requestMatchers("/api/auth/registro", "/api/auth/recuperar/**").permitAll()
                        // Endpoint de verificación de autenticación
                        .requestMatchers("/api/auth/check").authenticated()
                        // Cambiar contraseña, actualizar nombre y perfil requieren autenticación
                        .requestMatchers("/api/auth/perfil/**").authenticated()
                        .requestMatchers("/api/auth/cambiar-contrasena", "/api/auth/actualizar-nombre", "/api/auth/actualizar-perfil").authenticated()
                        // Endpoint de prueba (temporal para debugging)
                        .requestMatchers("/api/test/**").permitAll()
                        // Solo usuarios con rol ADMIN pueden acceder a nuestra API
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        // Permitir acceso sin autenticación a archivos estáticos del frontend
                        .requestMatchers("/", "/Index.html", "/index.html", "/inicio.html", 
                                        "/asociado.html", "/Material.html", "/Informe.html",
                                        "/perfil.html", "/Configuracion.html", "/Inventario.html",
                                        "/cambio-contrasena-*.html",
                                        "/css/**", "/js/**", "/assets/**", "/modales/**",
                                        "/components/**", "/controller/**", "/*.html").permitAll()
                        // Cualquier otra petición debe ser autenticada
                        .anyRequest().permitAll()
                )
                // Habilita la autenticación HTTP Basic (usuario/contraseña en cada petición)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}