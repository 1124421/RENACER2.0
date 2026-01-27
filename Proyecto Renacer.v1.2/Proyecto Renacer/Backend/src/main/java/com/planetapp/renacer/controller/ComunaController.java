package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Comuna; // Note el cambio de paquete
import com.planetapp.renacer.service.ComunaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comunas")
public class ComunaController {

    private final ComunaService comunaService;

    @Autowired
    public ComunaController(ComunaService comunaService) {
        this.comunaService = comunaService;
    }

    // POST: Crear una nueva Comuna (C - Create)
    @PostMapping
    public ResponseEntity<Comuna> createComuna(@RequestBody Comuna comuna) {
        try {
            Comuna savedComuna = comunaService.saveComuna(comuna);
            // Uso de constructor directo para 201 Created (retorna cuerpo)
            return new ResponseEntity<>(savedComuna, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Solución al error: Uso de metodo estático para 409 CONFLICT sin cuerpo.
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // GET: Obtener todas las Comunas (R - Read All)
    @GetMapping
    public ResponseEntity<List<Comuna>> getAllComunas() {
        List<Comuna> comunas = comunaService.getAllComunas();
        return ResponseEntity.ok(comunas); // Uso de metodo estático para 200 OK
    }

    // GET: Obtener una Comuna por ID (R - Read One)
    @GetMapping("/{id}")
    public ResponseEntity<Comuna> getComunaById(@PathVariable Integer id) {
        // Uso de .map() y .orElseGet() para un manejo elegante de 200 OK vs 404 NOT_FOUND
        return comunaService.getComunaById(id)
                .map(ResponseEntity::ok) // Si se encuentra, retorna 200 OK con cuerpo
                .orElseGet(() -> ResponseEntity.notFound().build()); // Si no se encuentra, retorna 404 Not Found sin cuerpo
    }

    // PUT: Actualizar una Comuna existente (U - Update)
    @PutMapping("/{id}")
    public ResponseEntity<Comuna> updateComuna(@PathVariable Integer id, @RequestBody Comuna comunaDetails) {
        try {
            Comuna updatedComuna = comunaService.updateComuna(id, comunaDetails);
            return ResponseEntity.ok(updatedComuna); // Retorna 200 OK
        } catch (IllegalStateException e) {
            // Si el servicio lanza la excepción (Comuna no encontrada)
            return ResponseEntity.notFound().build(); // Retorna 404 Not Found
        }
    }

    // DELETE: Eliminar una Comuna por ID (D - Delete)
    // Se recomienda usar ResponseEntity<Void> cuando la respuesta esperada es 204 NO_CONTENT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComuna(@PathVariable Integer id) {
        try {
            comunaService.deleteComuna(id);
            // Uso de metodo estático para 204 No Content (eliminación exitosa sin cuerpo)
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Comuna no encontrada
            return ResponseEntity.notFound().build(); // Retorna 404 Not Found
        }
    }
}