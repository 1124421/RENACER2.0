package com.planetapp.renacer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "material")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_material")
    private Integer idMaterial;

    @Column(name = "Nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    // Relación Many-to-One: Un material pertenece a una sola categoria.
    @ManyToOne(fetch = FetchType.EAGER)
    // Define la columna de clave foránea en la tabla 'material'
    @JoinColumn(name = "ID_categoria", nullable = false, foreignKey = @ForeignKey(name = "FK_Material_Categoria"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CategoriaMaterial categoria;
}