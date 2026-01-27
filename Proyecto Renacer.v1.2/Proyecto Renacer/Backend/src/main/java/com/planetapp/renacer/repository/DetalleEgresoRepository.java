package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.DetalleEgreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface DetalleEgresoRepository extends JpaRepository<DetalleEgreso, Integer> {

    // Nuevo metodo para sumar la cantidad egresada de un material en una bodega
    @Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM DetalleEgreso d WHERE d.material.idMaterial = :idMaterial AND d.bodegaOrigen.idBodega = :idBodega")
    BigDecimal sumCantidadByMaterialAndBodega(@Param("idMaterial") Integer idMaterial, @Param("idBodega") Integer idBodega);
}