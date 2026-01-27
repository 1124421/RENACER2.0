package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Material;
import com.planetapp.renacer.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiales")
public class MaterialController {

    private final MaterialService materialService;

    @Autowired
    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    // POST: Crear (C - Create)
    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        try {
            Material savedMaterial = materialService.saveMaterial(material);
            return new ResponseEntity<>(savedMaterial, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de unicidad (409) o FK no encontrada (400)
            String message = e.getMessage();
            if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Unicidad)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request (FK no existe)
            }
        }
    }

    // GET: Leer Todos (R - Read All)
    @GetMapping
    public ResponseEntity<List<Material>> getAllMateriales() {
        return ResponseEntity.ok(materialService.getAllMateriales());
    }

    // GET: Leer por ID (R - Read One)
    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable Integer id) {
        return materialService.getMaterialById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

    // PUT: Actualizar (U - Update)
    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Integer id, @RequestBody Material materialDetails) {
        try {
            Material updatedMaterial = materialService.updateMaterial(id, materialDetails);
            return ResponseEntity.ok(updatedMaterial);
        } catch (IllegalStateException e) {
            // Manejo si no existe el ID (404) o conflicto (409) o FK inexistente (404/400)
            String message = e.getMessage();
            if (message.contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found (ID de Material)
            } else if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Nombre duplicado)
            } else {
                // Si la Categoria no existe, el servicio lanza IllegalStateException,
                // lo tratamos como un error en la solicitud.
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        }
    }

    // DELETE: Eliminar (D - Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Integer id) {
        try {
            materialService.deleteMaterial(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            // El servicio lanza IllegalStateException si el ID no existe (404)
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            // CAPTURA AÑADIDA: El material está referenciado por otra tabla.
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }
}