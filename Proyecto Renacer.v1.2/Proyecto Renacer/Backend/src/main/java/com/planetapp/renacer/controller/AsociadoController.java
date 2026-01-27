package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Asociado;
import com.planetapp.renacer.service.AsociadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asociados")
public class AsociadoController {

    private final AsociadoService asociadoService;

    @Autowired
    public AsociadoController(AsociadoService asociadoService) {
        this.asociadoService = asociadoService;
    }

    // POST: Crear
    @PostMapping
    public ResponseEntity<Asociado> createAsociado(@RequestBody Asociado asociado) {
        try {
            Asociado savedAsociado = asociadoService.saveAsociado(asociado);
            return new ResponseEntity<>(savedAsociado, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            String message = e.getMessage();
            if (message.contains("documento") || message.contains("nombre")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Documento o Nombre/Apellido duplicado)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request (Barrio no existe o nulo)
            }
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<Asociado>> getAllAsociados() {
        return ResponseEntity.ok(asociadoService.getAllAsociados());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<Asociado> getAsociadoById(@PathVariable Integer id) {
        return asociadoService.getAsociadoById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Asociado> updateAsociado(@PathVariable Integer id, @RequestBody Asociado asociadoDetails) {
        try {
            Asociado updatedAsociado = asociadoService.updateAsociado(id, asociadoDetails);
            return ResponseEntity.ok(updatedAsociado);
        } catch (IllegalStateException e) {
            String message = e.getMessage();
            if (message.contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found (ID de Asociado)
            } else if (message.contains("documento") || message.contains("nombre")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Documento o Nombre/Apellido duplicado)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request (Barrio no existe)
            }
        }
    }

    // DELETE: Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsociado(@PathVariable Integer id) {
        try {
            asociadoService.deleteAsociado(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found (ID no existe)
        } catch (DataIntegrityViolationException e) {
            // Manejo si el Asociado está referenciado en encabezado_ingreso
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }
}