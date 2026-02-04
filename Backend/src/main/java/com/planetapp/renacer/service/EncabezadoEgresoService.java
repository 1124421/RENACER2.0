package com.planetapp.renacer.service;

import com.planetapp.renacer.model.*;
import com.planetapp.renacer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class EncabezadoEgresoService {

    private final EncabezadoEgresoRepository encabezadoEgresoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final MaterialRepository materialRepository;
    private final BodegaRepository bodegaRepository;

    // Repositorios para cálculo de Stock
    private final DetalleIngresoRepository detalleIngresoRepository;
    private final DetalleEgresoRepository detalleEgresoRepository;


    @Autowired
    public EncabezadoEgresoService(EncabezadoEgresoRepository encabezadoEgresoRepository,
                                   ClienteRepository clienteRepository,
                                   UsuarioRepository usuarioRepository,
                                   MaterialRepository materialRepository,
                                   BodegaRepository bodegaRepository,
                                   DetalleIngresoRepository detalleIngresoRepository,
                                   DetalleEgresoRepository detalleEgresoRepository) {
        this.encabezadoEgresoRepository = encabezadoEgresoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.materialRepository = materialRepository;
        this.bodegaRepository = bodegaRepository;
        this.detalleIngresoRepository = detalleIngresoRepository;
        this.detalleEgresoRepository = detalleEgresoRepository;
    }

    // Lógica crucial: Calcular el stock disponible
    private BigDecimal getAvailableStock(Integer idMaterial, Integer idBodega) {
        BigDecimal totalIngreso = detalleIngresoRepository.sumCantidadByMaterialAndBodega(idMaterial, idBodega);
        BigDecimal totalEgreso = detalleEgresoRepository.sumCantidadByMaterialAndBodega(idMaterial, idBodega);
        return totalIngreso.subtract(totalEgreso);
    }

    private void validateForeignKeysAndStock(EncabezadoEgreso egreso) {
        // 1. Validar FKs del Encabezado
        clienteRepository.findById(egreso.getCliente().getIdCliente())
                .orElseThrow(() -> new IllegalStateException("Cliente no encontrado."));

        if (egreso.getUsuario() != null && egreso.getUsuario().getIdUsuario() != null) {
            usuarioRepository.findById(egreso.getUsuario().getIdUsuario())
                    .orElseThrow(() -> new IllegalStateException("Usuario registrador no encontrado."));
        }

        if (egreso.getDetalles() == null || egreso.getDetalles().isEmpty()) {
            throw new IllegalStateException("La transacción debe contener al menos un detalle de material.");
        }

        // 2. Validar Stock, FKs de detalles y calcular el total
        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (DetalleEgreso detalle : egreso.getDetalles()) {
            // Validar FKs de Detalle
            materialRepository.findById(detalle.getMaterial().getIdMaterial())
                    .orElseThrow(() -> new IllegalStateException("Material con ID " + detalle.getMaterial().getIdMaterial() + " no encontrado."));
            bodegaRepository.findById(detalle.getBodegaOrigen().getIdBodega())
                    .orElseThrow(() -> new IllegalStateException("Bodega de origen con ID " + detalle.getBodegaOrigen().getIdBodega() + " no encontrado."));

            // LÓGICA DE CONTROL DE INVENTARIO
            BigDecimal cantidadAVender = detalle.getCantidad();
            Integer idMaterial = detalle.getMaterial().getIdMaterial();
            Integer idBodega = detalle.getBodegaOrigen().getIdBodega();

            BigDecimal stockDisponible = getAvailableStock(idMaterial, idBodega);

            // Si la cantidad a vender es mayor que el stock disponible
            if (cantidadAVender.compareTo(stockDisponible) > 0) {
                String msg = String.format("Stock insuficiente. Material ID %d en Bodega ID %d. Solicitado: %.2f, Disponible: %.2f.",
                        idMaterial, idBodega, cantidadAVender, stockDisponible);
                throw new IllegalStateException(msg);
            }

            // Cálculo: Cantidad * Precio
            BigDecimal subtotal = cantidadAVender
                    .multiply(detalle.getPrecioKgVenta())
                    .setScale(2, RoundingMode.HALF_UP);

            calculatedTotal = calculatedTotal.add(subtotal);
        }

        // Asignar el total calculado al encabezado
        egreso.setTotalVenta(calculatedTotal);
    }

    // CREATE / SAVE
    @Transactional
    public EncabezadoEgreso saveEncabezadoEgreso(EncabezadoEgreso egreso) {
        // 1. Validar FKs y Stock (La lógica más importante)
        validateForeignKeysAndStock(egreso);

        // 2. Establecer la relación bidireccional
        egreso.getDetalles().forEach(detalle -> detalle.setEncabezadoEgreso(egreso));

        // 3. Guardar la transacción de Egreso
        return encabezadoEgresoRepository.save(egreso);
    }

    // 2. READ ALL
    public List<EncabezadoEgreso> getAllEncabezados() {
        return encabezadoEgresoRepository.findAll();
    }

    // 3. READ BY ID
    public Optional<EncabezadoEgreso> getEncabezadoById(Integer id) {
        return encabezadoEgresoRepository.findById(id);
    }

    // 4. UPDATE
    @Transactional
    public EncabezadoEgreso updateEgreso(Integer id, EncabezadoEgreso updatedEgreso) {
        // 1. Verificar si existe el Encabezado
        EncabezadoEgreso existingEgreso = encabezadoEgresoRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Encabezado de Egreso no encontrado con ID: " + id));

        // 2. Validar FKs, recalcular total y validar detalles
        validateForeignKeysAndStock(updatedEgreso);

        // 3. ACTUALIZAR CAMPOS DEL ENCABEZADO
        existingEgreso.setCliente(updatedEgreso.getCliente());
        existingEgreso.setUsuario(updatedEgreso.getUsuario());
        existingEgreso.setTotalVenta(updatedEgreso.getTotalVenta());
        // La fecha de creación original se mantiene

        // 4. ACTUALIZAR DETALLES: Limpiamos y re-agregamos para que funcione el orphanRemoval=true
        existingEgreso.getDetalles().clear();

        updatedEgreso.getDetalles().forEach(detalle -> {
            detalle.setEncabezadoEgreso(existingEgreso);
            existingEgreso.getDetalles().add(detalle);
        });

        // 5. Guardar la entidad actualizada
        return encabezadoEgresoRepository.save(existingEgreso);
    }

    // 5. DELETE
    @Transactional
    public void deleteEgreso(Integer id) {
        // Buscamos la entidad o lanzamos excepción 404
        EncabezadoEgreso egreso = encabezadoEgresoRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Encabezado de Egreso no encontrado con ID: " + id));

        // Eliminamos la entidad (se eliminan en cascada los detalles)
        encabezadoEgresoRepository.delete(egreso);
    }
}