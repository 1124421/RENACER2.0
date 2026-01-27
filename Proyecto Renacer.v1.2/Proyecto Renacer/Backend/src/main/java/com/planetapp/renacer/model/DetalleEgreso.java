package com.planetapp.renacer.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal; // Importamos para manejo de dinero

@Entity
@Table(name = "detalle_egreso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleEgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_detalle_egreso")
    private Integer idDetalleEgreso;

    // Mapeo Many-to-One con EncabezadoEgreso (Lado de Retorno)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_egreso", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleEgreso_Encabezado"))
    @JsonBackReference // Rompe la recursión
    private EncabezadoEgreso encabezadoEgreso;

    // Relación Many-to-One con Material
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_material", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleEgreso_Material"))
    private Material material;

    // Relación Many-to-One con Bodega (Origen)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_bodega_origen", nullable = false, foreignKey = @ForeignKey(name = "FK_DetalleEgreso_Bodega"))
    private Bodega bodegaOrigen;

    @Column(name = "Cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad; // Peso en KG

    @Column(name = "Precio_kg_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioKgVenta;
}