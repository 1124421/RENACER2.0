package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.EncabezadoEgreso;
import com.planetapp.renacer.service.EncabezadoEgresoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/egresos")
public class EncabezadoEgresoController {

    private final EncabezadoEgresoService egresoService;

    @Autowired
    public EncabezadoEgresoController(EncabezadoEgresoService egresoService) {
        this.egresoService = egresoService;
    }

    // POST: Registrar una nueva venta (Encabezado + Detalles)
    @PostMapping
    public ResponseEntity<EncabezadoEgreso> createEgreso(@RequestBody EncabezadoEgreso egreso) {
        try {
            EncabezadoEgreso savedEgreso = egresoService.saveEncabezadoEgreso(egreso);
            return new ResponseEntity<>(savedEgreso, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de Stock insuficiente o FKs no existentes
            System.err.println("Error al registrar egreso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
        }
    }
    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<EncabezadoEgreso>> getAllEgresos() {
        return ResponseEntity.ok(egresoService.getAllEncabezados());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<EncabezadoEgreso> getEgresoById(@PathVariable Integer id) {
        return egresoService.getEncabezadoById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar un egreso completo
    @PutMapping("/{id}")
    public ResponseEntity<EncabezadoEgreso> updateEgreso(@PathVariable Integer id, @RequestBody EncabezadoEgreso egresoDetails) {
        try {
            EncabezadoEgreso updatedEgreso = egresoService.updateEgreso(id, egresoDetails);
            return ResponseEntity.ok(updatedEgreso);
        } catch (IllegalStateException e) {
            System.err.println("Error al actualizar egreso: " + e.getMessage());
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // DELETE: Eliminar un egreso completo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEgreso(@PathVariable Integer id) {
        try {
            egresoService.deleteEgreso(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }
}