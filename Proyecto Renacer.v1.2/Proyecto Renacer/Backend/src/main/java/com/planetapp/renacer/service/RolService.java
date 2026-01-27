package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Rol;
import com.planetapp.renacer.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolService {

    private final RolRepository rolRepository;

    @Autowired
    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    // CREATE / SAVE
    public Rol saveRol(Rol rol) {
        // Validación de unicidad
        if (rolRepository.findByNombre(rol.getNombre()).isPresent()) {
            throw new IllegalStateException("El Rol con nombre " + rol.getNombre() + " ya existe.");
        }
        return rolRepository.save(rol);
    }

    // READ ALL
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }

    // READ BY ID
    public Optional<Rol> getRolById(Integer id) {
        return rolRepository.findById(id);
    }

    // UPDATE
    public Rol updateRol(Integer id, Rol rolDetails) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Rol no encontrado con ID: " + id));

        // Validar unicidad del nuevo nombre, excluyendo el objeto actual
        Optional<Rol> existing = rolRepository.findByNombre(rolDetails.getNombre());
        if (existing.isPresent() && !existing.get().getIdRol().equals(id)) {
            throw new IllegalStateException("El Rol con nombre " + rolDetails.getNombre() + " ya existe.");
        }

        rol.setNombre(rolDetails.getNombre());
        return rolRepository.save(rol);
    }

    // DELETE
    public void deleteRol(Integer id) {
        boolean exists = rolRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Rol no encontrado con ID: " + id);
        }
        rolRepository.deleteById(id);
    }
}