package com.planetapp.renacer.repository;



import com.planetapp.renacer.model.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Integer> {
    // Adicionalmente, podemos definir un metodo de búsqueda por nombre,
    // ya que el campo 'Nombre' es UNIQUE en la base de datos (según renacer.sql).
    Optional<Comuna> findByNombre(String nombre);
}