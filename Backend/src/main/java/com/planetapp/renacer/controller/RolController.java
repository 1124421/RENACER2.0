package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Rol;
import com.planetapp.renacer.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    @Autowired
    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    // POST: Crear
    @PostMapping
    public ResponseEntity<Rol> createRol(@RequestBody Rol rol) {
        try {
            Rol savedRol = rolService.saveRol(rol);
            return new ResponseEntity<>(savedRol, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de unicidad del nombre
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<Rol>> getAllRoles() {
        return ResponseEntity.ok(rolService.getAllRoles());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<Rol> getRolById(@PathVariable Integer id) {
        return rolService.getRolById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Rol> updateRol(@PathVariable Integer id, @RequestBody Rol rolDetails) {
        try {
            Rol updatedRol = rolService.updateRol(id, rolDetails);
            return ResponseEntity.ok(updatedRol);
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Nombre duplicado)
        }
    }

    // DELETE: Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRol(@PathVariable Integer id) {
        try {
            rolService.deleteRol(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (DataIntegrityViolationException e) {
            // Manejo si el Rol está siendo utilizado por un Usuario
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }
}