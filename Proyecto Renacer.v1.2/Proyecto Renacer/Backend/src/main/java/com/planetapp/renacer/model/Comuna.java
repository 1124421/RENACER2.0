package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "comuna")
@Data // Genera getters, setters, toString, equalsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Comuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_comuna")
    private Integer idComuna;

    @Column(name = "Nombre", nullable = false, unique = true, length = 100)
    private String nombre;
}