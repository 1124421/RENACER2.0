package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.Material;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Integer> {
    
    /**
     * Busca un material por nombre cargando la categoría (eagerly) para evitar problemas de lazy loading.
     */
    @EntityGraph(attributePaths = {"categoria"})
    Optional<Material> findByNombre(String nombre);
    
    /**
     * Carga todos los materiales con sus categorías para evitar problemas de lazy loading durante la serialización JSON.
     */
    @Override
    @EntityGraph(attributePaths = {"categoria"})
    List<Material> findAll();
    
    /**
     * Busca un material por ID cargando la categoría (eagerly).
     */
    @Override
    @EntityGraph(attributePaths = {"categoria"})
    Optional<Material> findById(Integer id);
}