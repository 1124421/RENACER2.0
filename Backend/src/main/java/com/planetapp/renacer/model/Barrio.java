package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@Table(name = "barrio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Barrio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_barrio")
    private Integer idBarrio;

    @Column(name = "Nombre", nullable = false, unique = true , length = 100)
    private String nombre;

    // Relación Many-to-One: Un barrio pertenece a una sola comuna.
    @ManyToOne(fetch = FetchType.EAGER)
    // Define la columna de clave foránea en la tabla 'barrio'
    @JoinColumn(name = "ID_comuna", nullable = false, foreignKey = @ForeignKey(name = "FK_Barrio_Comuna"))
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Comuna comuna;
}