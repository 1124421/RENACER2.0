package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.Barrio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarrioRepository extends JpaRepository<Barrio, Integer> {
    // Métodos CRUD ya heredados.
}
