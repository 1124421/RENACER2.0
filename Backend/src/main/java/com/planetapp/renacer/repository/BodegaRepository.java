package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BodegaRepository extends JpaRepository<Bodega, Integer> {
    Optional<Bodega> findByNombre(String nombre);
}