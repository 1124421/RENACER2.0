package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.model.Rol;
import com.planetapp.renacer.repository.UsuarioRepository;
import com.planetapp.renacer.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private Rol validateRol(Integer idRol) {
        if (idRol == null) {
            throw new IllegalStateException("El ID del Rol es obligatorio para el Usuario.");
        }
        return rolRepository.findById(idRol)
                .orElseThrow(() -> new IllegalStateException("El Rol con ID " + idRol + " no existe."));
    }

    // CREATE / SAVE
    public Usuario saveUsuario(Usuario usuario) {
        // 1. Validar unicidad del username
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            throw new IllegalStateException("El Usuario con username " + usuario.getUsername() + " ya existe.");
        }

        // 2. Validar existencia del rol (Foreign Key)
        Rol rol = validateRol(usuario.getRol().getIdRol());
        usuario.setRol(rol);

        // 3. CIFRAR la contraseña antes de guardar (SEGURIDAD CRUCIAL)
        String hashedPassword = passwordEncoder.encode(usuario.getPasswordHash());
        usuario.setPasswordHash(hashedPassword);

        // 4. CIFRAR la respuesta secreta si existe
        if (usuario.getRespuestaSecreta() != null && !usuario.getRespuestaSecreta().isEmpty()) {
            String hashedRespuesta = passwordEncoder.encode(usuario.getRespuestaSecreta());
            usuario.setRespuestaSecreta(hashedRespuesta);
        }

        return usuarioRepository.save(usuario);
    }

    // READ ALL - Carga usuarios evitando problemas de lazy loading
    public List<Usuario> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        // Forzar la carga de los roles para evitar problemas de lazy loading
        usuarios.forEach(usuario -> {
            if (usuario.getRol() != null) {
                usuario.getRol().getNombre(); // Forzar carga
            }
        });
        return usuarios;
    }

    // READ BY ID
    public Optional<Usuario> getUsuarioById(Integer id) {
        return usuarioRepository.findById(id);
    }

    // UPDATE
    public Usuario updateUsuario(Integer id, Usuario usuarioDetails) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado con ID: " + id));

        // 1. Validar unicidad del nuevo username (excluyendo el objeto actual)
        Optional<Usuario> existing = usuarioRepository.findByUsername(usuarioDetails.getUsername());
        if (existing.isPresent() && !existing.get().getIdUsuario().equals(id)) {
            throw new IllegalStateException("El Usuario con username " + usuarioDetails.getUsername() + " ya existe.");
        }

        // 2. Validar existencia del nuevo rol
        Rol nuevoRol = validateRol(usuarioDetails.getRol().getIdRol());

        // Actualizar campos
        usuario.setNombreUsuario(usuarioDetails.getNombreUsuario());
        if (usuarioDetails.getApellido() != null) {
            usuario.setApellido(usuarioDetails.getApellido());
        }
        if (usuarioDetails.getDocumento() != null) {
            usuario.setDocumento(usuarioDetails.getDocumento());
        }
        if (usuarioDetails.getTelefono() != null) {
            usuario.setTelefono(usuarioDetails.getTelefono());
        }
        if (usuarioDetails.getCorreo() != null) {
            usuario.setCorreo(usuarioDetails.getCorreo());
        }
        usuario.setUsername(usuarioDetails.getUsername());
        usuario.setRol(nuevoRol);
        usuario.setActivo(usuarioDetails.getActivo());

        // IMPORTANTE: Si se recibe una contraseña, se debe cifrar.
        // Si el password hash en el detalle es nulo o vacío, mantenemos el anterior.
        if (usuarioDetails.getPasswordHash() != null && !usuarioDetails.getPasswordHash().isEmpty()) {
            usuario.setPasswordHash(passwordEncoder.encode(usuarioDetails.getPasswordHash()));
        }

        // Actualizar pregunta y respuesta secreta si se proporcionan
        if (usuarioDetails.getPreguntaSecreta() != null) {
            usuario.setPreguntaSecreta(usuarioDetails.getPreguntaSecreta());
        }
        if (usuarioDetails.getRespuestaSecreta() != null && !usuarioDetails.getRespuestaSecreta().isEmpty()) {
            usuario.setRespuestaSecreta(passwordEncoder.encode(usuarioDetails.getRespuestaSecreta()));
        }

        return usuarioRepository.save(usuario);
    }

    // Cambiar contraseña (con validación de contraseña actual)
    public void cambiarContrasena(String username, String contrasenaActual, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
        
        // Validar contraseña actual
        if (!passwordEncoder.matches(contrasenaActual, usuario.getPasswordHash())) {
            throw new IllegalStateException("La contraseña actual es incorrecta");
        }
        
        usuario.setPasswordHash(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);
    }

    // Cambiar contraseña sin validación (para recuperación)
    public void cambiarContrasenaSinValidacion(String username, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
        
        usuario.setPasswordHash(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);
    }

    // Obtener pregunta secreta por username
    public String obtenerPreguntaSecreta(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
        
        if (usuario.getPreguntaSecreta() == null || usuario.getPreguntaSecreta().isEmpty()) {
            throw new IllegalStateException("El usuario no tiene una pregunta secreta configurada.");
        }
        
        return usuario.getPreguntaSecreta();
    }

    // Validar respuesta secreta y obtener contraseña (sin hash para mostrar al usuario)
    public String recuperarContrasena(String username, String respuestaSecreta) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
        
        if (usuario.getRespuestaSecreta() == null || usuario.getRespuestaSecreta().isEmpty()) {
            throw new IllegalStateException("El usuario no tiene una respuesta secreta configurada.");
        }
        
        // Comparar respuesta secreta (está hasheada)
        if (!passwordEncoder.matches(respuestaSecreta, usuario.getRespuestaSecreta())) {
            throw new IllegalStateException("Respuesta secreta incorrecta.");
        }
        
        // NO podemos devolver la contraseña original porque está hasheada
        // En su lugar, generamos una contraseña temporal o informamos que debe cambiarla
        // Por ahora, devolvemos un mensaje indicando que debe cambiar la contraseña
        throw new IllegalStateException("RECUPERAR_CONTRASENA: Por seguridad, la contraseña no puede recuperarse. Debe cambiarla.");
    }

    // Validar respuesta secreta (sin devolver contraseña)
    public boolean validarRespuestaSecreta(String username, String respuestaSecreta) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
        
        if (usuario.getRespuestaSecreta() == null || usuario.getRespuestaSecreta().isEmpty()) {
            return false;
        }
        
        return passwordEncoder.matches(respuestaSecreta, usuario.getRespuestaSecreta());
    }

    // DELETE (Se recomienda desactivar en lugar de eliminar)
    public void deleteUsuario(Integer id) {
        // En un sistema real se debería usar DELETE, pero en este contexto se usa para 404
        boolean exists = usuarioRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Usuario no encontrado con ID: " + id);
        }
        // Para auditoría, es mejor desactivar. Pero si la necesidad es eliminar (delete), se usa:
        usuarioRepository.deleteById(id);
    }
}
