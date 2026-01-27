package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "encabezado_ingreso")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EncabezadoIngreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ingreso")
    private Integer idIngreso;

    @Column(name = "Fecha", nullable = false)
    private LocalDateTime fecha; // Usamos LocalDateTime para DATETIME

    @Column(name = "Total_pagado", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPagado;

    @Column(name = "Carreta", length = 50)
    private String carreta;

    // Relación Many-to-One con Asociado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_asociado", nullable = false, foreignKey = @ForeignKey(name = "FK_Ingreso_Asociado"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Asociado asociado;

    // Relación Many-to-One con Barrio (Ruta de recolección)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_barrio", nullable = false, foreignKey = @ForeignKey(name = "FK_Ingreso_Barrio"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Barrio barrio;

    // Relación Many-to-One con Usuario (Quién registró)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_usuario", foreignKey = @ForeignKey(name = "FK_Ingreso_Usuario"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario; // Asumiendo que ID_usuario puede ser NULL según su SQL

    // Relación One-to-Many con DetalleIngreso
    @OneToMany(mappedBy = "encabezadoIngreso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // <--- AÑADIR: Indica el lado que debe ser serializado
    private List<DetalleIngreso> detalles;

    // Metodo de utilidad para pre-persistir
    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}