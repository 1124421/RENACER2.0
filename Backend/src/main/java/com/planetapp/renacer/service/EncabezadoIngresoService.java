package com.planetapp.renacer.service;

import com.planetapp.renacer.model.*;
import com.planetapp.renacer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode; // Asegurarse de importar esto
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EncabezadoIngresoService {

    private final EncabezadoIngresoRepository encabezadoIngresoRepository;
    private final AsociadoRepository asociadoRepository;
    private final BarrioRepository barrioRepository;
    private final UsuarioRepository usuarioRepository;
    private final MaterialRepository materialRepository;
    private final BodegaRepository bodegaRepository;

    @Autowired
    public EncabezadoIngresoService(EncabezadoIngresoRepository encabezadoIngresoRepository,
                                    AsociadoRepository asociadoRepository,
                                    BarrioRepository barrioRepository,
                                    UsuarioRepository usuarioRepository,
                                    MaterialRepository materialRepository,
                                    BodegaRepository bodegaRepository) {
        this.encabezadoIngresoRepository = encabezadoIngresoRepository;
        this.asociadoRepository = asociadoRepository;
        this.barrioRepository = barrioRepository;
        this.usuarioRepository = usuarioRepository;
        this.materialRepository = materialRepository;
        this.bodegaRepository = bodegaRepository;
    }

    // Metodo de utilidad para validar existencia de FKs y calcular TotalPagado
    private void validateForeignKeys(EncabezadoIngreso ingreso) {
        asociadoRepository.findById(ingreso.getAsociado().getIdAsociado())
                .orElseThrow(() -> new IllegalStateException("Asociado no encontrado."));
        barrioRepository.findById(ingreso.getBarrio().getIdBarrio())
                .orElseThrow(() -> new IllegalStateException("Barrio no encontrado."));

        if (ingreso.getUsuario() != null && ingreso.getUsuario().getIdUsuario() != null) {
            usuarioRepository.findById(ingreso.getUsuario().getIdUsuario())
                    .orElseThrow(() -> new IllegalStateException("Usuario registrador no encontrado."));
        }

        if (ingreso.getDetalles() == null || ingreso.getDetalles().isEmpty()) {
            throw new IllegalStateException("La transacción debe contener al menos un detalle de material.");
        }

        // Validar FKs de los detalles y calcular el total
        BigDecimal calculatedTotal = BigDecimal.ZERO;
        for (DetalleIngreso detalle : ingreso.getDetalles()) {
            BigDecimal cantidad = detalle.getCantidad();
            BigDecimal precio = detalle.getPrecioPorKg();

            materialRepository.findById(detalle.getMaterial().getIdMaterial())
                    .orElseThrow(() -> new IllegalStateException("Material con ID " + detalle.getMaterial().getIdMaterial() + " no encontrado."));
            bodegaRepository.findById(detalle.getBodegaDestino().getIdBodega())
                    .orElseThrow(() -> new IllegalStateException("Bodega de destino con ID " + detalle.getBodegaDestino().getIdBodega() + " no encontrada."));

            // Cálculo: Cantidad * Precio (Aseguramos el redondeo para consistencia)
            BigDecimal subTotal = cantidad.multiply(precio).setScale(2, RoundingMode.HALF_UP);
            calculatedTotal = calculatedTotal.add(subTotal);
        }

        // Asignar el total calculado al encabezado
        ingreso.setTotalPagado(calculatedTotal);
    }

    // 1. CREATE / SAVE
    @Transactional
    public EncabezadoIngreso saveEncabezadoIngreso(EncabezadoIngreso ingreso) {
        // 1. Validar FKs y calcular total
        validateForeignKeys(ingreso);

        // 2. Asegurar la fecha de la transacción
        if (ingreso.getFecha() == null) {
            ingreso.setFecha(LocalDateTime.now());
        }

        // 3. Establecer la relación bidireccional (Crucial para JPA/Hibernate)
        ingreso.getDetalles().forEach(detalle -> detalle.setEncabezadoIngreso(ingreso));

        // 4. Guardar
        return encabezadoIngresoRepository.save(ingreso);
    }

    // 2. READ ALL
    @Transactional(readOnly = true)
    public List<EncabezadoIngreso> getAllEncabezados() {
        List<EncabezadoIngreso> ingresos = encabezadoIngresoRepository.findAll();
        // Forzar la inicialización de todas las relaciones lazy para evitar problemas de serialización
        for (EncabezadoIngreso ingreso : ingresos) {
            if (ingreso.getAsociado() != null) {
                ingreso.getAsociado().getNombre(); // Forzar inicialización
                if (ingreso.getAsociado().getBarrio() != null) {
                    ingreso.getAsociado().getBarrio().getNombre(); // Forzar inicialización
                }
            }
            if (ingreso.getBarrio() != null) {
                ingreso.getBarrio().getNombre(); // Forzar inicialización
            }
            if (ingreso.getDetalles() != null) {
                for (DetalleIngreso detalle : ingreso.getDetalles()) {
                    if (detalle.getMaterial() != null) {
                        detalle.getMaterial().getNombre(); // Forzar inicialización
                        if (detalle.getMaterial().getCategoria() != null) {
                            detalle.getMaterial().getCategoria().getNombre(); // Forzar inicialización
                        }
                    }
                    if (detalle.getBodegaDestino() != null) {
                        detalle.getBodegaDestino().getNombre(); // Forzar inicialización
                    }
                }
            }
        }
        return ingresos;
    }

    // 3. READ BY ID
    public Optional<EncabezadoIngreso> getEncabezadoById(Integer id) {
        return encabezadoIngresoRepository.findById(id);
    }

    // 4. UPDATE
    @Transactional
    public EncabezadoIngreso updateIngreso(Integer id, EncabezadoIngreso updatedIngreso) {
        // 1. Verificar si existe el Encabezado
        EncabezadoIngreso existingIngreso = encabezadoIngresoRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Encabezado de Ingreso no encontrado con ID: " + id));

        // 2. Validar FKs, recalcular total y validar detalles
        validateForeignKeys(updatedIngreso);

        // 3. ACTUALIZAR CAMPOS DEL ENCABEZADO
        existingIngreso.setAsociado(updatedIngreso.getAsociado());
        existingIngreso.setBarrio(updatedIngreso.getBarrio());
        existingIngreso.setUsuario(updatedIngreso.getUsuario());
        existingIngreso.setTotalPagado(updatedIngreso.getTotalPagado());
        existingIngreso.setCarreta(updatedIngreso.getCarreta());
        // La fecha de creación original se mantiene

        // 4. ACTUALIZAR DETALLES: Limpiamos y re-agregamos para que funcione el orphanRemoval=true
        existingIngreso.getDetalles().clear();

        updatedIngreso.getDetalles().forEach(detalle -> {
            detalle.setEncabezadoIngreso(existingIngreso);
            existingIngreso.getDetalles().add(detalle);
        });

        // 5. Guardar la entidad actualizada
        return encabezadoIngresoRepository.save(existingIngreso);
    }

    // 5. DELETE
    @Transactional
    public void deleteIngreso(Integer id) { // Cambiamos el nombre para que coincida con el controlador
        // Buscamos la entidad o lanzamos excepción 404
        EncabezadoIngreso ingreso = encabezadoIngresoRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Encabezado de Ingreso no encontrado con ID: " + id));

        // Eliminamos la entidad (se eliminan en cascada los detalles)
        encabezadoIngresoRepository.delete(ingreso);
    }
}