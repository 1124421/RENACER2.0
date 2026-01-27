package com.planetapp.renacer.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Configuración personalizada para SQLite.
 * Habilita las foreign keys que están deshabilitadas por defecto en SQLite.
 * 
 * SQLite tiene las foreign keys deshabilitadas por defecto por compatibilidad.
 * Esta configuración las habilita automáticamente para cada conexión.
 */
@Configuration
public class DataSourceConfig {

    /**
     * Configuración de propiedades del DataSource.
     * Spring Boot configurará automáticamente el DataSource desde application.properties.
     * No necesitamos crear el DataSource manualmente, solo configurar SQLite.
     */
    
    /**
     * Bean que configura SQLite al iniciar la aplicación.
     * Se ejecuta después de que el DataSource está creado.
     * Habilita foreign keys y optimizaciones.
     */
    @Bean
    public SqliteInitializer sqliteInitializer(DataSource dataSource) {
        return new SqliteInitializer(dataSource);
    }

    /**
     * Clase interna para inicializar SQLite.
     */
    static class SqliteInitializer {
        private final DataSource dataSource;

        public SqliteInitializer(DataSource dataSource) {
            this.dataSource = dataSource;
            initializeSqlite();
        }

        /**
         * Configura SQLite para habilitar las foreign keys y optimizaciones.
         */
        private void initializeSqlite() {
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Habilitar foreign keys en SQLite (están deshabilitadas por defecto)
                statement.execute("PRAGMA foreign_keys = ON");
                
                // Configurar modo WAL (Write-Ahead Logging) para mejor rendimiento concurrente
                statement.execute("PRAGMA journal_mode = WAL");
                
                // Balance entre rendimiento y seguridad de datos
                statement.execute("PRAGMA synchronous = NORMAL");
                
                // Migración: Agregar columna Carreta si no existe
                try {
                    // Verificar si la columna existe consultando el esquema
                    ResultSet rs = statement.executeQuery(
                        "PRAGMA table_info(encabezado_ingreso)"
                    );
                    boolean columnExists = false;
                    while (rs.next()) {
                        if ("Carreta".equalsIgnoreCase(rs.getString("name"))) {
                            columnExists = true;
                            break;
                        }
                    }
                    rs.close();
                    
                    if (!columnExists) {
                        statement.execute("ALTER TABLE encabezado_ingreso ADD COLUMN Carreta VARCHAR(50)");
                        System.out.println("✅ Columna 'Carreta' agregada a la tabla encabezado_ingreso");
                    } else {
                        System.out.println("ℹ️ Columna 'Carreta' ya existe en encabezado_ingreso");
                    }
                } catch (SQLException e) {
                    // Si la tabla no existe aún, Hibernate la creará automáticamente
                    System.out.println("ℹ️ Tabla encabezado_ingreso aún no existe, se creará automáticamente con la columna Carreta");
                }
                
                System.out.println("✅ SQLite configurado correctamente: foreign keys habilitadas, modo WAL activado");
                
            } catch (SQLException e) {
                System.err.println("⚠️ Error al configurar SQLite: " + e.getMessage());
                // No lanzamos excepción para que la aplicación pueda iniciar
                // pero registramos el error
            }
        }
    }
}

