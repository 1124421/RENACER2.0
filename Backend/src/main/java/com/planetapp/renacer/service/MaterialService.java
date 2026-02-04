package com.planetapp.renacer.service;

import com.planetapp.renacer.model.CategoriaMaterial;
import com.planetapp.renacer.model.Material;
import com.planetapp.renacer.repository.CategoriaMaterialRepository;
import com.planetapp.renacer.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CategoriaMaterialRepository categoriaMaterialRepository;

    @Autowired
    public MaterialService(MaterialRepository materialRepository, CategoriaMaterialRepository categoriaMaterialRepository) {
        this.materialRepository = materialRepository;
        this.categoriaMaterialRepository = categoriaMaterialRepository;
    }

    // Metodo de utilidad para validar la existencia de la Categoria
    private CategoriaMaterial validateCategoria(Integer idCategoria) {
        return categoriaMaterialRepository.findById(idCategoria)
                .orElseThrow(() -> new IllegalStateException("La Categoría con ID " + idCategoria + " no existe."));
    }

    // CREATE / SAVE
    public Material saveMaterial(Material material) {
        // 1. Si ya existe un material con el mismo nombre, reutilizarlo en lugar de crear uno nuevo
        Optional<Material> materialExistente = materialRepository.findByNombre(material.getNombre());
        if (materialExistente.isPresent()) {
            // Validar que la categoría sea la misma
            Material existente = materialExistente.get();
            if (existente.getCategoria().getIdCategoria().equals(material.getCategoria().getIdCategoria())) {
                // Devolver el material existente (las cantidades se suman en DetalleIngreso)
                return existente;
            } else {
                throw new IllegalStateException("Ya existe un Material con nombre " + material.getNombre() + " pero con diferente categoría.");
            }
        }

        // 2. Validar existencia de la categoría (Foreign Key)
        CategoriaMaterial categoria = validateCategoria(material.getCategoria().getIdCategoria());

        material.setCategoria(categoria);
        return materialRepository.save(material);
    }

    // READ ALL
    public List<Material> getAllMateriales() {
        return materialRepository.findAll();
    }

    // READ BY ID
    public Optional<Material> getMaterialById(Integer id) {
        return materialRepository.findById(id);
    }

    // UPDATE
    public Material updateMaterial(Integer id, Material materialDetails) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Material no encontrado con ID: " + id));

        // 1. Validar unicidad del nuevo nombre, excluyendo el ID actual
        Optional<Material> existing = materialRepository.findByNombre(materialDetails.getNombre());
        if (existing.isPresent() && !existing.get().getIdMaterial().equals(id)) {
            throw new IllegalStateException("El Material con nombre " + materialDetails.getNombre() + " ya existe.");
        }

        // 2. Validar existencia de la nueva categoría (Foreign Key)
        CategoriaMaterial nuevaCategoria = validateCategoria(materialDetails.getCategoria().getIdCategoria());

        // Actualizar campos
        material.setNombre(materialDetails.getNombre());
        material.setCategoria(nuevaCategoria);

        return materialRepository.save(material);
    }

    // DELETE
    public void deleteMaterial(Integer id) {
        boolean exists = materialRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Material no encontrado con ID: " + id);
        }
        materialRepository.deleteById(id);
    }
}