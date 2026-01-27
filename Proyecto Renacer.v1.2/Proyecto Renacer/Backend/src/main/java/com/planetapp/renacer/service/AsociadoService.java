package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Asociado;
import com.planetapp.renacer.model.Barrio;
import com.planetapp.renacer.repository.AsociadoRepository;
import com.planetapp.renacer.repository.BarrioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsociadoService {

    private final AsociadoRepository asociadoRepository;
    private final BarrioRepository barrioRepository;

    @Autowired
    public AsociadoService(AsociadoRepository asociadoRepository, BarrioRepository barrioRepository) {
        this.asociadoRepository = asociadoRepository;
        this.barrioRepository = barrioRepository;
    }

    // Metodo de utilidad para validar la existencia del Barrio
    private Barrio validateBarrio(Integer idBarrio) {
        // ID_barrio es opcional en la tabla asociado según su SQL, pero lo haremos obligatorio
        // para fines de gestión (se puede modificar la lógica si se requiere que sea nulo).
        if (idBarrio == null) {
            throw new IllegalStateException("El ID del Barrio es obligatorio para el Asociado.");
        }
        return barrioRepository.findById(idBarrio)
                .orElseThrow(() -> new IllegalStateException("El Barrio con ID " + idBarrio + " no existe."));
    }

    // CREATE / SAVE (ACTUALIZADO)
    public Asociado saveAsociado(Asociado asociado) {
        // 0. Validar que el ID esté presente y no esté duplicado
        if (asociado.getIdAsociado() == null) {
            throw new IllegalStateException("El ID del asociado es obligatorio.");
        }
        if (asociadoRepository.findById(asociado.getIdAsociado()).isPresent()) {
            throw new IllegalStateException("El Asociado con ID " + asociado.getIdAsociado() + " ya existe.");
        }
        
        // 1. Validar unicidad por DOCUMENTO (la validación más fuerte y crucial)
        if (asociadoRepository.findByDocumento(asociado.getDocumento()).isPresent()) {
            throw new IllegalStateException("El Asociado con documento " + asociado.getDocumento() + " ya existe.");
        }

        // 2. Validar unicidad por Nombre y Apellido (opcional, basado en su solicitud)
        if (asociadoRepository.findByNombreAndApellido(asociado.getNombre(), asociado.getApellido()).isPresent()) {
            throw new IllegalStateException("El Asociado con nombre " + asociado.getNombre() + " " + asociado.getApellido() + " ya existe.");
        }

        // 3. Validar existencia del barrio (Foreign Key)
        Barrio barrio = validateBarrio(asociado.getBarrio().getIdBarrio());
        asociado.setBarrio(barrio);

        return asociadoRepository.save(asociado);
    }

    // READ ALL
    public List<Asociado> getAllAsociados() {
        return asociadoRepository.findAll();
    }

    // READ BY ID
    public Optional<Asociado> getAsociadoById(Integer id) {
        return asociadoRepository.findById(id);
    }

    // UPDATE (ACTUALIZADO)
    public Asociado updateAsociado(Integer id, Asociado asociadoDetails) {
        Asociado asociado = asociadoRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Asociado no encontrado con ID: " + id));

        // 1. Validar unicidad del nuevo DOCUMENTO (excluyendo el objeto actual)
        Optional<Asociado> existingDoc = asociadoRepository.findByDocumento(asociadoDetails.getDocumento());
        if (existingDoc.isPresent() && !existingDoc.get().getIdAsociado().equals(id)) {
            throw new IllegalStateException("El Asociado con documento " + asociadoDetails.getDocumento() + " ya existe.");
        }

        // 2. Validar unicidad del nuevo Nombre y Apellido (excluyendo el objeto actual)
        Optional<Asociado> existingName = asociadoRepository.findByNombreAndApellido(asociadoDetails.getNombre(), asociadoDetails.getApellido());
        if (existingName.isPresent() && !existingName.get().getIdAsociado().equals(id)) {
            throw new IllegalStateException("El Asociado con nombre " + asociadoDetails.getNombre() + " " + asociadoDetails.getApellido() + " ya existe.");
        }

        // 3. Validar y actualizar barrio (manejar caso null)
        if (asociadoDetails.getBarrio() != null && asociadoDetails.getBarrio().getIdBarrio() != null) {
            Barrio nuevoBarrio = validateBarrio(asociadoDetails.getBarrio().getIdBarrio());
            asociado.setBarrio(nuevoBarrio);
        } else {
            // Si no se proporciona barrio, mantener el actual o usar uno por defecto
            if (asociado.getBarrio() == null) {
                // Si el asociado actual tampoco tiene barrio, buscar uno por defecto
                List<Barrio> barrios = barrioRepository.findAll();
                if (barrios.isEmpty()) {
                    throw new IllegalStateException("No hay barrios disponibles en el sistema. Por favor, cree un barrio primero.");
                }
                asociado.setBarrio(barrios.get(0));
            }
            // Si ya tiene barrio, mantenerlo
        }

        // Actualizar campos (solo los que el usuario puede editar)
        asociado.setNombre(asociadoDetails.getNombre());
        asociado.setApellido(asociadoDetails.getApellido());
        asociado.setDocumento(asociadoDetails.getDocumento());
        asociado.setCarreta(asociadoDetails.getCarreta() != null ? asociadoDetails.getCarreta() : asociado.getCarreta());
        asociado.setTelefono(asociadoDetails.getTelefono());
        asociado.setCorreo(asociadoDetails.getCorreo());
        asociado.setTipo(asociadoDetails.getTipo());
        // Actualizar campos adicionales del formulario
        if (asociadoDetails.getFechaInicio() != null) {
            asociado.setFechaInicio(asociadoDetails.getFechaInicio());
        }
        if (asociadoDetails.getTipoContrato() != null) {
            asociado.setTipoContrato(asociadoDetails.getTipoContrato());
        }
        if (asociadoDetails.getCargo() != null) {
            asociado.setCargo(asociadoDetails.getCargo());
        }

        return asociadoRepository.save(asociado);
    }

    // DELETE
    public void deleteAsociado(Integer id) {
        boolean exists = asociadoRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Asociado no encontrado con ID: " + id);
        }
        asociadoRepository.deleteById(id);
    }
}