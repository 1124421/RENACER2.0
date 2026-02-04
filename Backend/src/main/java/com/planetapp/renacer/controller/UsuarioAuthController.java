package com.planetapp.renacer.controller;

import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.model.Rol;
import com.planetapp.renacer.repository.RolRepository;
import com.planetapp.renacer.repository.UsuarioRepository;
import com.planetapp.renacer.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UsuarioAuthController {

    private final UsuarioService usuarioService;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioAuthController(UsuarioService usuarioService, RolRepository rolRepository, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Crear nueva cuenta de usuario
     */
    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> crearCuenta(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String nombreCompleto = datos.get("nombreCompleto");
            String username = datos.get("username");
            String password = datos.get("password");
            String preguntaSecreta = datos.get("preguntaSecreta");
            String respuestaSecreta = datos.get("respuestaSecreta");

            if (nombreCompleto == null || nombreCompleto.trim().isEmpty() ||
                username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                preguntaSecreta == null || preguntaSecreta.trim().isEmpty() ||
                respuestaSecreta == null || respuestaSecreta.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Todos los campos son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }

            // Buscar rol por defecto (usualmente Administrador o Usuario)
            // Si no existe, usar el primero disponible
            Rol rolPorDefecto = rolRepository.findAll().stream()
                    .filter(r -> r.getNombre().equalsIgnoreCase("Administrador"))
                    .findFirst()
                    .orElse(rolRepository.findAll().isEmpty() ? null : rolRepository.findAll().get(0));

            if (rolPorDefecto == null) {
                response.put("success", false);
                response.put("message", "No hay roles disponibles en el sistema");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombreUsuario(nombreCompleto);
            nuevoUsuario.setUsername(username);
            nuevoUsuario.setPasswordHash(password); // Se hasheará en el servicio
            nuevoUsuario.setPreguntaSecreta(preguntaSecreta);
            nuevoUsuario.setRespuestaSecreta(respuestaSecreta); // Se hasheará en el servicio
            nuevoUsuario.setRol(rolPorDefecto);
            nuevoUsuario.setActivo(true);
            // Campos opcionales (pueden ser null)
            nuevoUsuario.setApellido(null);
            nuevoUsuario.setDocumento(null);
            nuevoUsuario.setTelefono(null);
            nuevoUsuario.setCorreo(null);

            Usuario usuarioGuardado = usuarioService.saveUsuario(nuevoUsuario);
            
            response.put("success", true);
            response.put("message", "Cuenta creada exitosamente");
            response.put("usuario", usuarioGuardado.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear la cuenta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener pregunta secreta por username
     */
    @GetMapping("/recuperar/pregunta/{username}")
    public ResponseEntity<Map<String, Object>> obtenerPreguntaSecreta(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String pregunta = usuarioService.obtenerPreguntaSecreta(username);
            response.put("success", true);
            response.put("preguntaSecreta", pregunta);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Validar respuesta secreta y permitir cambio de contraseña
     */
    @PostMapping("/recuperar/validar")
    public ResponseEntity<Map<String, Object>> validarRespuestaSecreta(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = datos.get("username");
            String respuestaSecreta = datos.get("respuestaSecreta");

            if (username == null || respuestaSecreta == null) {
                response.put("success", false);
                response.put("message", "Usuario y respuesta secreta son requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            boolean esValida = usuarioService.validarRespuestaSecreta(username, respuestaSecreta);
            
            if (esValida) {
                response.put("success", true);
                response.put("message", "Respuesta secreta correcta");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Respuesta secreta incorrecta");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Establecer nueva contraseña después de validar respuesta secreta
     */
    @PostMapping("/recuperar/cambiar-contrasena")
    public ResponseEntity<Map<String, Object>> cambiarContrasenaRecuperacion(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = datos.get("username");
            String nuevaContrasena = datos.get("nuevaContrasena");
            String respuestaSecreta = datos.get("respuestaSecreta");

            if (username == null || nuevaContrasena == null || respuestaSecreta == null) {
                response.put("success", false);
                response.put("message", "Todos los campos son requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            // Validar respuesta secreta primero
            boolean esValida = usuarioService.validarRespuestaSecreta(username, respuestaSecreta);
            if (!esValida) {
                response.put("success", false);
                response.put("message", "Respuesta secreta incorrecta");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Cambiar contraseña (sin validar contraseña actual en recuperación)
            usuarioService.cambiarContrasenaSinValidacion(username, nuevaContrasena);
            
            response.put("success", true);
            response.put("message", "Contraseña actualizada exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Cambiar contraseña (requiere autenticación y contraseña actual)
     */
    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<Map<String, Object>> cambiarContrasena(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = datos.get("username");
            String contrasenaActual = datos.get("contrasenaActual");
            String nuevaContrasena = datos.get("nuevaContrasena");

            if (username == null || contrasenaActual == null || nuevaContrasena == null) {
                response.put("success", false);
                response.put("message", "Usuario, contraseña actual y nueva contraseña son requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            usuarioService.cambiarContrasena(username, contrasenaActual, nuevaContrasena);
            
            response.put("success", true);
            response.put("message", "Contraseña actualizada exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Obtener perfil del usuario actual por username
     */
    @GetMapping("/perfil/{username}")
    public ResponseEntity<Map<String, Object>> obtenerPerfil(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Buscar usuario directamente por username usando el repositorio
            var usuarioOpt = usuarioRepository.findByUsername(username);
            var usuario = usuarioOpt.orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));
            
            Map<String, Object> usuarioMap = new HashMap<>();
            usuarioMap.put("idUsuario", usuario.getIdUsuario());
            usuarioMap.put("nombreUsuario", usuario.getNombreUsuario() != null ? usuario.getNombreUsuario() : "");
            usuarioMap.put("apellido", usuario.getApellido() != null ? usuario.getApellido() : "");
            usuarioMap.put("documento", usuario.getDocumento() != null ? usuario.getDocumento() : "");
            usuarioMap.put("telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "");
            usuarioMap.put("correo", usuario.getCorreo() != null ? usuario.getCorreo() : "");
            usuarioMap.put("username", usuario.getUsername());
            
            // Obtener nombre del rol de forma segura
            String nombreRol = "";
            if (usuario.getRol() != null) {
                try {
                    nombreRol = usuario.getRol().getNombre() != null ? usuario.getRol().getNombre() : "";
                } catch (Exception e) {
                    // Si hay error al acceder al rol (lazy loading), intentar cargarlo
                    nombreRol = "Usuario";
                }
            }
            usuarioMap.put("rol", nombreRol);
            
            response.put("success", true);
            response.put("usuario", usuarioMap);
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Actualizar perfil completo del usuario
     */
    @PostMapping("/actualizar-perfil")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = datos.get("username");
            String nombreUsuario = datos.get("nombreUsuario");
            String apellido = datos.get("apellido");
            String documento = datos.get("documento");
            String telefono = datos.get("telefono");
            String correo = datos.get("correo");

            if (username == null) {
                response.put("success", false);
                response.put("message", "Username es requerido");
                return ResponseEntity.badRequest().body(response);
            }

            // Buscar usuario por username usando el repositorio
            var usuarioEncontrado = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));
            
            // Actualizar campos si se proporcionan (actualización parcial)
            if (nombreUsuario != null && !nombreUsuario.trim().isEmpty()) {
                usuarioEncontrado.setNombreUsuario(nombreUsuario.trim());
            }
            if (apellido != null && !apellido.trim().isEmpty()) {
                usuarioEncontrado.setApellido(apellido.trim());
            }
            if (documento != null && !documento.trim().isEmpty()) {
                usuarioEncontrado.setDocumento(documento.trim());
            }
            if (telefono != null && !telefono.trim().isEmpty()) {
                usuarioEncontrado.setTelefono(telefono.trim());
            }
            if (correo != null && !correo.trim().isEmpty()) {
                usuarioEncontrado.setCorreo(correo.trim());
            }
            
            // Guardar directamente usando el repositorio para actualización parcial
            usuarioRepository.save(usuarioEncontrado);
            
            response.put("success", true);
            response.put("message", "Perfil actualizado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Actualizar nombre de usuario
     */
    @PostMapping("/actualizar-nombre")
    public ResponseEntity<Map<String, Object>> actualizarNombreUsuario(@RequestBody Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = datos.get("username");
            String nuevoNombre = datos.get("nuevoNombre");

            if (username == null || nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Usuario y nuevo nombre son requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            // Buscar usuario por username
            var usuarios = usuarioService.getAllUsuarios();
            var usuarioEncontrado = usuarios.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));
            
            usuarioEncontrado.setNombreUsuario(nuevoNombre.trim());
            usuarioService.updateUsuario(usuarioEncontrado.getIdUsuario(), usuarioEncontrado);
            
            response.put("success", true);
            response.put("message", "Nombre actualizado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar nombre: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

