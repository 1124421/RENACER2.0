package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.CategoriaMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaMaterialRepository extends JpaRepository<CategoriaMaterial, Integer> {
    Optional<CategoriaMaterial> findByNombre(String nombre);
}