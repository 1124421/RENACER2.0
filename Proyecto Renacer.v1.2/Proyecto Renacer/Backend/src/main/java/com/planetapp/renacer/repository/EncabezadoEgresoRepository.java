package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.EncabezadoEgreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EncabezadoEgresoRepository extends JpaRepository<EncabezadoEgreso, Integer> {
    // El ORM proporciona automáticamente los métodos CRUD (save, findById, findAll, deleteById)
}