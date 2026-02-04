package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Bodega;
import com.planetapp.renacer.service.BodegaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bodegas")
public class BodegaController {

    private final BodegaService bodegaService;

    @Autowired
    public BodegaController(BodegaService bodegaService) {
        this.bodegaService = bodegaService;
    }

    // POST: Crear
    @PostMapping
    public ResponseEntity<Bodega> createBodega(@RequestBody Bodega bodega) {
        try {
            Bodega savedBodega = bodegaService.saveBodega(bodega);
            return new ResponseEntity<>(savedBodega, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Unicidad)
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<Bodega>> getAllBodegas() {
        return ResponseEntity.ok(bodegaService.getAllBodegas());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<Bodega> getBodegaById(@PathVariable Integer id) {
        return bodegaService.getBodegaById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

    // PUT: Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Bodega> updateBodega(@PathVariable Integer id, @RequestBody Bodega bodegaDetails) {
        try {
            Bodega updatedBodega = bodegaService.updateBodega(id, bodegaDetails);
            return ResponseEntity.ok(updatedBodega);
        } catch (IllegalStateException e) {
            // Manejo de 404 (ID no existe) o 409 (Nombre duplicado)
            return bodegaService.getBodegaById(id).isPresent() ?
                    ResponseEntity.status(HttpStatus.CONFLICT).build() :
                    ResponseEntity.notFound().build();
        }
    }

    // DELETE: Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBodega(@PathVariable Integer id) {
        try {
            bodegaService.deleteBodega(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found (ID no existe)
        } catch (DataIntegrityViolationException e) {
            // Manejo si la Bodega está referenciada por Inventario o DetalleEgreso
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }
}