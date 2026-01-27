package com.planetapp.renacer.service;

import com.planetapp.renacer.model.NombreMaterial;
import com.planetapp.renacer.repository.NombreMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NombreMaterialService {

    private final NombreMaterialRepository nombreMaterialRepository;

    @Autowired
    public NombreMaterialService(NombreMaterialRepository nombreMaterialRepository) {
        this.nombreMaterialRepository = nombreMaterialRepository;
    }

    // CREATE / SAVE
    public NombreMaterial saveNombreMaterial(NombreMaterial nombreMaterial) {
        if (nombreMaterialRepository.findByNombre(nombreMaterial.getNombre()).isPresent()) {
            throw new IllegalStateException("El Nombre de Material con nombre " + nombreMaterial.getNombre() + " ya existe.");
        }
        return nombreMaterialRepository.save(nombreMaterial);
    }

    // READ ALL
    public List<NombreMaterial> getAllNombresMaterial() {
        return nombreMaterialRepository.findAll();
    }

    // READ BY ID
    public Optional<NombreMaterial> getNombreMaterialById(Integer id) {
        return nombreMaterialRepository.findById(id);
    }

    // UPDATE
    public NombreMaterial updateNombreMaterial(Integer id, NombreMaterial nombreMaterialDetails) {
        NombreMaterial nombreMaterial = nombreMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Nombre de Material no encontrado con ID: " + id));

        // Validar unicidad del nuevo nombre, excluyendo el ID actual
        Optional<NombreMaterial> existing = nombreMaterialRepository.findByNombre(nombreMaterialDetails.getNombre());
        if (existing.isPresent() && !existing.get().getIdNombreMaterial().equals(id)) {
            throw new IllegalStateException("El Nombre de Material con nombre " + nombreMaterialDetails.getNombre() + " ya existe.");
        }

        nombreMaterial.setNombre(nombreMaterialDetails.getNombre());
        return nombreMaterialRepository.save(nombreMaterial);
    }

    // DELETE
    public void deleteNombreMaterial(Integer id) {
        boolean exists = nombreMaterialRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Nombre de Material no encontrado con ID: " + id);
        }
        nombreMaterialRepository.deleteById(id);
    }
}


