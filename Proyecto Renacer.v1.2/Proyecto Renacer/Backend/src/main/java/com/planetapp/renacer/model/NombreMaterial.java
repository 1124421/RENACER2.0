package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "nombre_material")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NombreMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_nombre_material")
    private Integer idNombreMaterial;

    @Column(name = "Nombre", nullable = false, unique = true, length = 100)
    private String nombre;
}


