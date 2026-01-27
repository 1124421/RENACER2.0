package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_ingreso")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DetalleIngreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_detalle_ingreso")
    private Integer idDetalleIngreso;

    @Column(name = "Cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad; // Peso en KG

    @Column(name = "Precio_por_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPorKg;

    // Relación Many-to-One con EncabezadoIngreso
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_ingreso", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleIngreso_Encabezado"))
    @JsonBackReference // <--- AÑADIR: Indica el lado a IGNORAR para romper la recursión
    private EncabezadoIngreso encabezadoIngreso;

    // Relación Many-to-One con Material
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_material", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleIngreso_Material"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Material material;

    // Relación Many-to-One con Bodega (Destino)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_bodega_destino", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleIngreso_Bodega"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Bodega bodegaDestino;
}