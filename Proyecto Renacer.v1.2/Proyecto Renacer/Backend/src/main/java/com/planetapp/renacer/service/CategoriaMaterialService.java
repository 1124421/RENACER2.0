package com.planetapp.renacer.service;

import com.planetapp.renacer.model.CategoriaMaterial;
import com.planetapp.renacer.repository.CategoriaMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaMaterialService {

    private final CategoriaMaterialRepository categoriaMaterialRepository;

    @Autowired
    public CategoriaMaterialService(CategoriaMaterialRepository categoriaMaterialRepository) {
        this.categoriaMaterialRepository = categoriaMaterialRepository;
    }

    // CREATE / SAVE
    public CategoriaMaterial saveCategoria(CategoriaMaterial categoria) {
        if (categoriaMaterialRepository.findByNombre(categoria.getNombre()).isPresent()) {
            throw new IllegalStateException("La Categoría de Material con nombre " + categoria.getNombre() + " ya existe.");
        }
        return categoriaMaterialRepository.save(categoria);
    }

    // READ ALL
    public List<CategoriaMaterial> getAllCategorias() {
        return categoriaMaterialRepository.findAll();
    }

    // READ BY ID
    public Optional<CategoriaMaterial> getCategoriaById(Integer id) {
        return categoriaMaterialRepository.findById(id);
    }

    // UPDATE
    public CategoriaMaterial updateCategoria(Integer id, CategoriaMaterial categoriaDetails) {
        CategoriaMaterial categoria = categoriaMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Categoría no encontrada con ID: " + id));

        // Validar unicidad del nuevo nombre, excluyendo el objeto actual
        Optional<CategoriaMaterial> existing = categoriaMaterialRepository.findByNombre(categoriaDetails.getNombre());
        if (existing.isPresent() && !existing.get().getIdCategoria().equals(id)) {
            throw new IllegalStateException("La Categoría de Material con nombre " + categoriaDetails.getNombre() + " ya existe.");
        }

        categoria.setNombre(categoriaDetails.getNombre());
        return categoriaMaterialRepository.save(categoria);
    }

    // DELETE
    public void deleteCategoria(Integer id) {
        boolean exists = categoriaMaterialRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Categoría no encontrada con ID: " + id);
        }
        categoriaMaterialRepository.deleteById(id);
    }
}