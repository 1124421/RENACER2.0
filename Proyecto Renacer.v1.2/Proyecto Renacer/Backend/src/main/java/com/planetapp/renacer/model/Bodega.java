package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "bodega")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_bodega")
    private Integer idBodega;

    @Column(name = "Nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "Direccion", nullable = false, length = 255)
    private String direccion;
}