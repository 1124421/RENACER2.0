package com.planetapp.renacer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_usuario")
    private Integer idUsuario;

    @Column(name = "Nombre_usuario", nullable = false, length = 255)
    private String nombreUsuario;

    @Column(name = "Apellido", nullable = true, length = 255)
    private String apellido;

    @Column(name = "Documento", nullable = true, length = 20)
    private String documento;

    @Column(name = "Telefono", nullable = true, length = 20)
    private String telefono;

    @Column(name = "Correo", nullable = true, length = 100)
    private String correo;

    @Column(name = "Username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "Password_hash", nullable = false, length = 255) // Para almacenar el hash de la contraseña
    private String passwordHash;

    @Column(name = "Pregunta_secreta", nullable = true, length = 255)
    private String preguntaSecreta;

    @Column(name = "Respuesta_secreta", nullable = true, length = 255) // Se guardará hasheada
    private String respuestaSecreta;

    // Relación Many-to-One con Rol
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_rol", nullable = false, foreignKey = @ForeignKey(name = "FK_Usuario_Rol"))
    private Rol rol;

    @Column(name = "Activo", nullable = false)
    private Boolean activo = true; // Por defecto, un nuevo usuario está activo
}