package com.planetapp.renacer.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal; // Importamos para manejo de dinero

@Entity
@Table(name = "encabezado_egreso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncabezadoEgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_egreso")
    private Integer idEgreso;

    @Column(name = "Fecha", nullable = false)
    private LocalDateTime fecha;

    // Relación Many-to-One con Cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_cliente", nullable = false, foreignKey = @ForeignKey(name = "FK_Egreso_Cliente"))
    private Cliente cliente;

    // Columna para el total calculado
    @Column(name = "Total_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVenta;

    // Relación Many-to-One con Usuario (Quién registró)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_usuario", foreignKey = @ForeignKey(name = "FK_Egreso_Usuario"))
    private Usuario usuario;

    // Relación One-to-Many con DetalleEgreso (Lado Administrado)
    @OneToMany(mappedBy = "encabezadoEgreso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Rompe la recursión
    private List<DetalleEgreso> detalles;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}