package com.planetapp.renacer.config;

import com.planetapp.renacer.model.Rol;
import com.planetapp.renacer.model.Usuario;
import com.planetapp.renacer.repository.RolRepository;
import com.planetapp.renacer.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Inicializa los datos básicos de la aplicación al arrancar.
 * Crea el rol ADMIN y el usuario Brandon si no existen.
 * 
 * @Order(1) asegura que se ejecute después de que la base de datos esté lista.
 */
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(RolRepository rolRepository, 
                          UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            System.out.println("============================================");
            System.out.println("INICIALIZANDO DATOS DE LA APLICACION");
            System.out.println("============================================");
            initializeRoles();
            initializeUsers();
            System.out.println("============================================");
        } catch (Exception e) {
            System.err.println("ERROR CRITICO en DataInitializer: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-lanzar para que Spring muestre el error
        }
    }

    /**
     * Inicializa los roles básicos de la aplicación.
     */
    private void initializeRoles() {
        // Crear rol ADMIN si no existe
        Optional<Rol> adminRol = rolRepository.findByNombre("ADMIN");
        if (adminRol.isEmpty()) {
            Rol rol = new Rol();
            rol.setNombre("ADMIN");
            rolRepository.save(rol);
            System.out.println("✅ Rol ADMIN creado");
        } else {
            System.out.println("ℹ️  Rol ADMIN ya existe (ID: " + adminRol.get().getIdRol() + ")");
        }
    }

    /**
     * Inicializa los usuarios básicos de la aplicación.
     */
    @Transactional
    public void initializeUsers() {
        // Obtener el rol ADMIN (debe existir después de initializeRoles)
        Rol adminRol = rolRepository.findByNombre("ADMIN")
                .orElseThrow(() -> new RuntimeException("El rol ADMIN no existe. Debe crearse primero."));

        // Buscar o crear usuario Brandon
        Optional<Usuario> brandonUsuarioOpt = usuarioRepository.findByUsername("Brandon");
        Usuario usuario;
        
        if (brandonUsuarioOpt.isEmpty()) {
            // Crear usuario nuevo
            usuario = new Usuario();
            usuario.setNombreUsuario("Brandon");
            usuario.setApellido("Leal");
            usuario.setUsername("Brandon");
            usuario.setRol(adminRol);
            usuario.setActivo(true);
            usuario.setDocumento("1019454548");
            usuario.setTelefono("302222222");
            usuario.setCorreo("brandon@gmail.com");
            usuario.setPreguntaSecreta("Cual es el nombre de mi mascota actual");
            usuario.setRespuestaSecreta(passwordEncoder.encode("magnus"));
            System.out.println("ℹ️  Creando nuevo usuario 'Brandon'...");
        } else {
            // Usuario existe, actualizarlo con datos del perfil
            usuario = brandonUsuarioOpt.get();
            usuario.setNombreUsuario("Brandon");
            usuario.setApellido("Leal");
            usuario.setRol(adminRol);
            usuario.setActivo(true);
            // Agregar datos del perfil si no existen
            if (usuario.getDocumento() == null || usuario.getDocumento().isEmpty()) {
                usuario.setDocumento("1019454548");
            }
            if (usuario.getTelefono() == null || usuario.getTelefono().isEmpty()) {
                usuario.setTelefono("302222222");
            }
            if (usuario.getCorreo() == null || usuario.getCorreo().isEmpty()) {
                usuario.setCorreo("brandon@gmail.com");
            }
            // SIEMPRE actualizar pregunta y respuesta secreta
            usuario.setPreguntaSecreta("Cual es el nombre de mi mascota actual");
            usuario.setRespuestaSecreta(passwordEncoder.encode("magnus"));
            System.out.println("ℹ️  Usuario 'Brandon' encontrado (ID: " + usuario.getIdUsuario() + "), actualizando...");
        }
        
        // SIEMPRE actualizar la contraseña para asegurar que sea correcta
        String contrasenaPlana = "brandon256";
        String nuevaContrasena = passwordEncoder.encode(contrasenaPlana);
        usuario.setPasswordHash(nuevaContrasena);
        
        // Guardar el usuario
        usuario = usuarioRepository.save(usuario);
        System.out.println("ℹ️  Usuario guardado en BD (ID: " + usuario.getIdUsuario() + ")");
        
        // Recargar el usuario de la BD para verificar que se guardó correctamente
        Usuario usuarioVerificado = usuarioRepository.findByUsername("Brandon")
                .orElseThrow(() -> new RuntimeException("No se pudo encontrar el usuario después de guardarlo"));
        
        // Usar el adminRol que ya tenemos en memoria directamente
        // No intentamos acceder al rol del usuario recargado para evitar problemas de lazy loading
        String nombreRol = adminRol.getNombre();
        
        // Verificar que la contraseña se guardó correctamente
        boolean contrasenaValida = passwordEncoder.matches(contrasenaPlana, usuarioVerificado.getPasswordHash());
        
        if (contrasenaValida) {
            System.out.println("✅ Usuario 'Brandon' creado/actualizado con éxito");
            System.out.println("   - ID: " + usuarioVerificado.getIdUsuario());
            System.out.println("   - Username: " + usuarioVerificado.getUsername());
            System.out.println("   - Contraseña: brandon256");
            System.out.println("   - Rol: " + nombreRol);
            System.out.println("   - Estado: " + (usuarioVerificado.getActivo() ? "Activo" : "Inactivo"));
            System.out.println("   - Verificación de contraseña: ✅ OK");
        } else {
            System.err.println("❌ ERROR: La contraseña no se pudo verificar después de guardar");
            System.err.println("   Hash guardado: " + (usuarioVerificado.getPasswordHash() != null ? 
                usuarioVerificado.getPasswordHash().substring(0, Math.min(50, usuarioVerificado.getPasswordHash().length())) + "..." : "null"));
        }
    }
}
