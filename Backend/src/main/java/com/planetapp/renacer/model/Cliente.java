package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_cliente")
    private Integer idCliente;

    @Column(name = "Nombre_empresa", nullable = false, length = 255)
    private String nombreEmpresa;

    @Column(name = "Documento", nullable = false, unique = true, length = 20) // NIT, Cédula, etc.
    private String documento;

    @Column(name = "Telefono", length = 20)
    private String telefono;

    @Column(name = "Correo", length = 100)
    private String correo;
}