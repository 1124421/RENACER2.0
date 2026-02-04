package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@Table(name = "asociado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Asociado {

    @Id
    // Removido @GeneratedValue para permitir ID manual
    @Column(name = "ID_asociado", nullable = false, unique = true)
    private Integer idAsociado;

    // CAMBIO: Nombres y Apellidos separados
    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "Apellido", nullable = false, length = 155) // Lo definimos aquí para hacer la suma hasta 255
    private String apellido;

    // ... (El resto de campos se mantiene igual)
    @Column(name = "Documento", nullable = false, unique = true, length = 20)
    private String documento;

    @Column(name = "Carreta", length = 50)
    private String carreta;

    @Column(name = "Telefono", length = 20)
    private String telefono;

    @Column(name = "Correo", length = 100)
    private String correo;

    @Enumerated(EnumType.STRING)
    @Column(name = "Tipo", nullable = false, length = 20)
    private TipoAsociado tipo;
    
    // Campos adicionales del formulario
    @Column(name = "Fecha_inicio", length = 50)
    private String fechaInicio;
    
    @Column(name = "Tipo_contrato", length = 100)
    private String tipoContrato;
    
    @Column(name = "Cargo", length = 100)
    private String cargo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_barrio", foreignKey = @ForeignKey(name = "FK_Asociado_Barrio"))
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Barrio barrio;
}