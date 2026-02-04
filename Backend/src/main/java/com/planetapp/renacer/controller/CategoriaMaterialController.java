package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.CategoriaMaterial;
import com.planetapp.renacer.service.CategoriaMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-material")
public class CategoriaMaterialController {

    private final CategoriaMaterialService categoriaMaterialService;

    @Autowired
    public CategoriaMaterialController(CategoriaMaterialService categoriaMaterialService) {
        this.categoriaMaterialService = categoriaMaterialService;
    }

    // POST: Crear
    @PostMapping
    public ResponseEntity<CategoriaMaterial> createCategoria(@RequestBody CategoriaMaterial categoria) {
        try {
            CategoriaMaterial savedCategoria = categoriaMaterialService.saveCategoria(categoria);
            return new ResponseEntity<>(savedCategoria, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de unicidad
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<CategoriaMaterial>> getAllCategorias() {
        return ResponseEntity.ok(categoriaMaterialService.getAllCategorias());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaMaterial> getCategoriaById(@PathVariable Integer id) {
        return categoriaMaterialService.getCategoriaById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

    // PUT: Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaMaterial> updateCategoria(@PathVariable Integer id, @RequestBody CategoriaMaterial categoriaDetails) {
        try {
            CategoriaMaterial updatedCategoria = categoriaMaterialService.updateCategoria(id, categoriaDetails);
            return ResponseEntity.ok(updatedCategoria);
        } catch (IllegalStateException e) {
            // Manejo si no existe el ID (404) o si el nombre ya existe (409)
            // Se asume 409 para nombres duplicados y 404 para ID no existente
            return categoriaMaterialService.getCategoriaById(id).isPresent() ?
                    ResponseEntity.status(HttpStatus.CONFLICT).build() :
                    ResponseEntity.notFound().build();
        }
    }

    // DELETE: Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoria(@PathVariable Integer id) {
        try {
            categoriaMaterialService.deleteCategoria(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
