package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.EncabezadoIngreso;
import com.planetapp.renacer.dto.BarrioDesempenoDTO;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EncabezadoIngresoRepository extends JpaRepository<EncabezadoIngreso, Integer> {

    /**
     * Carga todos los ingresos con sus relaciones para evitar problemas de lazy loading durante la serialización JSON.
     */
    @Override
    @EntityGraph(attributePaths = {
        "asociado", 
        "asociado.barrio",
        "barrio", 
        "barrio.comuna",
        "usuario", 
        "detalles", 
        "detalles.material", 
        "detalles.material.categoria",
        "detalles.bodegaDestino"
    })
    List<EncabezadoIngreso> findAll();
    
    /**
     * Busca un ingreso por ID cargando todas las relaciones (eagerly).
     */
    @Override
    @EntityGraph(attributePaths = {
        "asociado", 
        "asociado.barrio",
        "barrio", 
        "barrio.comuna",
        "usuario", 
        "detalles", 
        "detalles.material", 
        "detalles.material.categoria",
        "detalles.bodegaDestino"
    })
    Optional<EncabezadoIngreso> findById(Integer id);

    // Consulta para obtener el total de material (Detalles) y transacciones (Encabezados)
    // Agrupado por Barrio
    @Query("SELECT new com.planetapp.renacer.dto.BarrioDesempenoDTO(" +
            "ei.barrio.idBarrio, " +
            "ei.barrio.nombre, " +
            "SUM(di.cantidad), " +
            "COUNT(DISTINCT ei.idIngreso)) " +
            "FROM EncabezadoIngreso ei JOIN ei.detalles di " +
            "GROUP BY ei.barrio.idBarrio, ei.barrio.nombre")
    List<BarrioDesempenoDTO> getDesempenoPorBarrio();
}