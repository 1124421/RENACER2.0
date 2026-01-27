package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Bodega;
import com.planetapp.renacer.repository.BodegaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BodegaService {

    private final BodegaRepository bodegaRepository;

    @Autowired
    public BodegaService(BodegaRepository bodegaRepository) {
        this.bodegaRepository = bodegaRepository;
    }

    // CREATE / SAVE
    public Bodega saveBodega(Bodega bodega) {
        if (bodegaRepository.findByNombre(bodega.getNombre()).isPresent()) {
            throw new IllegalStateException("La Bodega con nombre " + bodega.getNombre() + " ya existe.");
        }
        return bodegaRepository.save(bodega);
    }

    // READ ALL
    public List<Bodega> getAllBodegas() {
        return bodegaRepository.findAll();
    }

    // READ BY ID
    public Optional<Bodega> getBodegaById(Integer id) {
        return bodegaRepository.findById(id);
    }

    // UPDATE
    public Bodega updateBodega(Integer id, Bodega bodegaDetails) {
        Bodega bodega = bodegaRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Bodega no encontrada con ID: " + id));

        // Validar unicidad del nuevo nombre, excluyendo el objeto actual
        Optional<Bodega> existing = bodegaRepository.findByNombre(bodegaDetails.getNombre());
        if (existing.isPresent() && !existing.get().getIdBodega().equals(id)) {
            throw new IllegalStateException("La Bodega con nombre " + bodegaDetails.getNombre() + " ya existe.");
        }

        bodega.setNombre(bodegaDetails.getNombre());
        bodega.setDireccion(bodegaDetails.getDireccion());
        return bodegaRepository.save(bodega);
    }

    // DELETE
    public void deleteBodega(Integer id) {
        boolean exists = bodegaRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Bodega no encontrada con ID: " + id);
        }
        bodegaRepository.deleteById(id);
    }
}