package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Comuna;
import com.planetapp.renacer.repository.ComunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComunaService {

    private final ComunaRepository comunaRepository;

    @Autowired
    public ComunaService(ComunaRepository comunaRepository) {
        this.comunaRepository = comunaRepository;
    }

    // CREATE / SAVE
    public Comuna saveComuna(Comuna comuna) {
        // Logica de negocio: Evitar duplicados (Aunque la DB lo valida, es mejor hacerlo en el servicio)
        if (comunaRepository.findByNombre(comuna.getNombre()).isPresent()) {
            throw new IllegalStateException("La comuna con nombre " + comuna.getNombre() + " ya existe.");
        }
        return comunaRepository.save(comuna);
    }

    // READ ALL
    public List<Comuna> getAllComunas() {
        return comunaRepository.findAll();
    }

    // READ BY ID
    public Optional<Comuna> getComunaById(Integer id) {
        return comunaRepository.findById(id);
    }

    // UPDATE
    public Comuna updateComuna(Integer id, Comuna comunaDetails) {
        Comuna comuna = comunaRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Comuna no encontrada con ID: " + id));

        // Actualizar solo el nombre
        comuna.setNombre(comunaDetails.getNombre());

        return comunaRepository.save(comuna);
    }

    // DELETE
    public void deleteComuna(Integer id) {
        boolean exists = comunaRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Comuna no encontrada con ID: " + id);
        }
        comunaRepository.deleteById(id);
    }
}