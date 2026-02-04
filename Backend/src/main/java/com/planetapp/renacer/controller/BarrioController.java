package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Barrio;
import com.planetapp.renacer.service.BarrioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barrios")
public class BarrioController {

    private final BarrioService barrioService;

    @Autowired
    public BarrioController(BarrioService barrioService) {
        this.barrioService = barrioService;
    }

    // POST: Crear un nuevo Barrio (C - Create)
    @PostMapping
    public ResponseEntity<?> createBarrio(@RequestBody Barrio barrio) {
        try {
            Barrio savedBarrio = barrioService.saveBarrio(barrio);
            return new ResponseEntity<>(savedBarrio, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            // Maneja la violación de la restricción UNIQUE del nombre del barrio (409)
            if (e.getMessage().contains("Duplicate entry")) {
                String errorMessage = "Error de unicidad: El nombre de Barrio '" + barrio.getNombre() + "' ya existe.";
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage); // 409 Conflict
            }
            // Otras violaciones de integridad de datos (ej: campo NOT NULL ausente)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error de integridad de datos."); // 400 Bad Request
        } catch (IllegalStateException e) {
            // Maneja fallas de lógica de negocio o FKs (ej: ID de Comuna no encontrado)
            // Esta excepción es lanzada por la validación dentro del BarrioService.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // 400 Bad Request
        } catch (Exception e) {
            // Error interno no esperado
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }

    // GET: Obtener todos los Barrios (R - Read All)
    @GetMapping
    public ResponseEntity<List<Barrio>> getAllBarrios() {
        List<Barrio> barrios = barrioService.getAllBarrios();
        return ResponseEntity.ok(barrios);
    }

    // GET: Obtener un Barrio por ID (R - Read One)
    @GetMapping("/{id}")
    public ResponseEntity<Barrio> getBarrioById(@PathVariable Integer id) {
        return barrioService.getBarrioById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar un Barrio existente (U - Update)
    @PutMapping("/{id}")
    public ResponseEntity<Barrio> updateBarrio(@PathVariable Integer id, @RequestBody Barrio barrioDetails) {
        try {
            Barrio updatedBarrio = barrioService.updateBarrio(id, barrioDetails);
            return ResponseEntity.ok(updatedBarrio);
        } catch (IllegalStateException e) {
            // Captura error si el Barrio o la Comuna referenciada no existe
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE: Eliminar un Barrio por ID (D - Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBarrio(@PathVariable Integer id) {
        try {
            barrioService.deleteBarrio(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
