package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.NombreMaterial;
import com.planetapp.renacer.service.NombreMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nombres-material")
public class NombreMaterialController {

    private final NombreMaterialService nombreMaterialService;

    @Autowired
    public NombreMaterialController(NombreMaterialService nombreMaterialService) {
        this.nombreMaterialService = nombreMaterialService;
    }

    // POST: Crear (C - Create)
    @PostMapping
    public ResponseEntity<NombreMaterial> createNombreMaterial(@RequestBody NombreMaterial nombreMaterial) {
        try {
            NombreMaterial savedNombreMaterial = nombreMaterialService.saveNombreMaterial(nombreMaterial);
            return new ResponseEntity<>(savedNombreMaterial, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de unicidad (409)
            String message = e.getMessage();
            if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Unicidad)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
            }
        }
    }

    // GET: Leer Todos (R - Read All)
    @GetMapping
    public ResponseEntity<List<NombreMaterial>> getAllNombresMaterial() {
        return ResponseEntity.ok(nombreMaterialService.getAllNombresMaterial());
    }

    // GET: Leer por ID (R - Read One)
    @GetMapping("/{id}")
    public ResponseEntity<NombreMaterial> getNombreMaterialById(@PathVariable Integer id) {
        return nombreMaterialService.getNombreMaterialById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar (U - Update)
    @PutMapping("/{id}")
    public ResponseEntity<NombreMaterial> updateNombreMaterial(@PathVariable Integer id, @RequestBody NombreMaterial nombreMaterialDetails) {
        try {
            NombreMaterial updatedNombreMaterial = nombreMaterialService.updateNombreMaterial(id, nombreMaterialDetails);
            return ResponseEntity.ok(updatedNombreMaterial);
        } catch (IllegalStateException e) {
            String message = e.getMessage();
            if (message.contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found
            } else if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Unicidad)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
            }
        }
    }

    // DELETE: Eliminar (D - Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNombreMaterial(@PathVariable Integer id) {
        try {
            nombreMaterialService.deleteNombreMaterial(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (FK constraint)
        }
    }
}


