package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.Asociado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AsociadoRepository extends JpaRepository<Asociado, Integer> {
    // CAMBIO: Buscamos por la combinación de Nombre y Apellido para la validación de unicidad
    Optional<Asociado> findByNombreAndApellido(String nombre, String apellido);

    // Mantenemos la búsqueda por documento, ya que es UNIQUE en la DB
    Optional<Asociado> findByDocumento(String documento);
}