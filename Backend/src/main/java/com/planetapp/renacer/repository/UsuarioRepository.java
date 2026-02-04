package com.planetapp.renacer.repository;

import com.planetapp.renacer.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    /**
     * Busca un usuario por username cargando el rol (eagerly) para evitar problemas de lazy loading.
     * @EntityGraph asegura que el rol se cargue junto con el usuario en una sola consulta.
     */
    @EntityGraph(attributePaths = {"rol"})
    Optional<Usuario> findByUsername(String username);
    
    /**
     * Carga todos los usuarios con sus roles para evitar problemas de lazy loading durante la serialización JSON.
     */
    @Override
    @EntityGraph(attributePaths = {"rol"})
    java.util.List<Usuario> findAll();
}