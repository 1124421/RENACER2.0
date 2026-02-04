package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // POST: Crear
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario savedUsuario = usuarioService.saveUsuario(usuario);
            return new ResponseEntity<>(savedUsuario, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            String message = e.getMessage();
            if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Username duplicado)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request (Rol no existe)
            }
        }
    }

    // GET: Leer Todos
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.getAllUsuarios());
    }

    // GET: Leer por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        return usuarioService.getUsuarioById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Integer id, @RequestBody Usuario usuarioDetails) {
        try {
            Usuario updatedUsuario = usuarioService.updateUsuario(id, usuarioDetails);
            return ResponseEntity.ok(updatedUsuario);
        } catch (IllegalStateException e) {
            String message = e.getMessage();
            if (message.contains("no encontrado")) {
                return ResponseEntity.notFound().build(); // 404 Not Found (ID de Usuario)
            } else if (message.contains("existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict (Username duplicado)
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request (Rol no existe)
            }
        }
    }

    // DELETE: Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Integer id) {
        try {
            usuarioService.deleteUsuario(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found (ID no existe)
        } catch (DataIntegrityViolationException e) {
            // Manejo si el Usuario está referenciado en encabezado_ingreso o encabezado_egreso
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
    }
}