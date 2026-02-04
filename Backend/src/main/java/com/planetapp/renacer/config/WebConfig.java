package com.planetapp.renacer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración para servir archivos estáticos del frontend.
 * Los archivos están en src/main/resources/static/ y Spring Boot los sirve automáticamente
 * con los MIME types correctos por defecto.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Mapear la raíz (/) a Index.html (nuevo frontend)
        registry.addViewController("/").setViewName("forward:/Index.html");
    }
}

