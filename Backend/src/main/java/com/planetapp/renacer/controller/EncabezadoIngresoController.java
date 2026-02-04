package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.EncabezadoIngreso;
import com.planetapp.renacer.service.EncabezadoIngresoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingresos")
public class EncabezadoIngresoController {

    private final EncabezadoIngresoService ingresoService;

    @Autowired
    public EncabezadoIngresoController(EncabezadoIngresoService ingresoService) {
        this.ingresoService = ingresoService;
    }

    // POST: Registrar una nueva compra (Encabezado + Detalles)
    @PostMapping
    public ResponseEntity<EncabezadoIngreso> createIngreso(@RequestBody EncabezadoIngreso ingreso) {
        try {
            EncabezadoIngreso savedIngreso = ingresoService.saveEncabezadoIngreso(ingreso);
            return new ResponseEntity<>(savedIngreso, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Manejo de errores de FK no existentes o detalles faltantes
            System.err.println("Error al registrar ingreso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<EncabezadoIngreso>> getAllIngresos() {
        return ResponseEntity.ok(ingresoService.getAllEncabezados());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<EncabezadoIngreso> getIngresoById(@PathVariable Integer id) {
        return ingresoService.getEncabezadoById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar un ingreso completo (Método implementado en discusiones previas)
    @PutMapping("/{id}")
    public ResponseEntity<EncabezadoIngreso> updateIngreso(@PathVariable Integer id, @RequestBody EncabezadoIngreso ingresoDetails) {
        try {
            EncabezadoIngreso updatedIngreso = ingresoService.updateIngreso(id, ingresoDetails);
            return ResponseEntity.ok(updatedIngreso); // 200 OK
        } catch (IllegalStateException e) {
            System.err.println("Error al actualizar ingreso: " + e.getMessage());
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found
            }
            // Manejo de errores de FK o lógica de negocio
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request
        }
    }

    // DELETE: Eliminar un ingreso completo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngreso(@PathVariable Integer id) {
        try {
            // Usar el método deleteIngreso implementado en el servicio
            ingresoService.deleteIngreso(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            // Si no se encuentra
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}