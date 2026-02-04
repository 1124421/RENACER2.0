package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Barrio;
import com.planetapp.renacer.model.Comuna;
import com.planetapp.renacer.repository.BarrioRepository;
import com.planetapp.renacer.repository.ComunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BarrioService {

    private final BarrioRepository barrioRepository;
    private final ComunaRepository comunaRepository; // Inyección de ComunaRepository para validación

    @Autowired
    public BarrioService(BarrioRepository barrioRepository, ComunaRepository comunaRepository) {
        this.barrioRepository = barrioRepository;
        this.comunaRepository = comunaRepository;
    }

    // CREATE / SAVE
    public Barrio saveBarrio(Barrio barrio) {
        // Validación crítica: Asegurar que la Comuna asociada exista
        Integer idComuna = barrio.getComuna().getIdComuna();
        Comuna comuna = comunaRepository.findById(idComuna)
                .orElseThrow(() -> new IllegalStateException("La Comuna con ID " + idComuna + " no existe."));

        // Se reasigna la Comuna gestionada (managed) al Barrio, aunque no es estrictamente necesario
        // si la ID ya está en el objeto Comuna. Es una buena práctica de JPA.
        barrio.setComuna(comuna);

        return barrioRepository.save(barrio);
    }

    // READ ALL
    public List<Barrio> getAllBarrios() {
        return barrioRepository.findAll();
    }

    // READ BY ID
    public Optional<Barrio> getBarrioById(Integer id) {
        return barrioRepository.findById(id);
    }

    // UPDATE
    public Barrio updateBarrio(Integer id, Barrio barrioDetails) {
        Barrio barrio = barrioRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Barrio no encontrado con ID: " + id));

        // Validación de existencia de la nueva Comuna (si se intenta cambiar)
        Integer idNuevaComuna = barrioDetails.getComuna().getIdComuna();
        Comuna nuevaComuna = comunaRepository.findById(idNuevaComuna)
                .orElseThrow(() -> new IllegalStateException("La nueva Comuna con ID " + idNuevaComuna + " no existe."));

        // Actualizar campos
        barrio.setNombre(barrioDetails.getNombre());
        barrio.setComuna(nuevaComuna); // Asignar la nueva comuna válida

        return barrioRepository.save(barrio);
    }

    // DELETE
    public void deleteBarrio(Integer id) {
        boolean exists = barrioRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Barrio no encontrado con ID: " + id);
        }
        barrioRepository.deleteById(id);
    }
}