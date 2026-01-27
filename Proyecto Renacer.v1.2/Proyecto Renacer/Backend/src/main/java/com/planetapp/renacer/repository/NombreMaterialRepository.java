package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.NombreMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NombreMaterialRepository extends JpaRepository<NombreMaterial, Integer> {
    Optional<NombreMaterial> findByNombre(String nombre);
}


