package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.DetalleIngreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DetalleIngresoRepository extends JpaRepository<DetalleIngreso, Integer> {

    // Nuevo metodo para sumar la cantidad ingresada de un material en una bodega
    @Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM DetalleIngreso d WHERE d.material.idMaterial = :idMaterial AND d.bodegaDestino.idBodega = :idBodega")
    BigDecimal sumCantidadByMaterialAndBodega(@Param("idMaterial") Integer idMaterial, @Param("idBodega") Integer idBodega);

    // Consulta JPQL para calcular los totales de Ingreso por Material
    @Query("SELECT di.material.idMaterial, di.material.nombre, " +
            "SUM(di.cantidad), " +
            "SUM(di.cantidad * di.precioPorKg) " +
            "FROM DetalleIngreso di " +
            "GROUP BY di.material.idMaterial, di.material.nombre")
    List<Object[]> getCostoYCantidadTotalPorMaterial();
}