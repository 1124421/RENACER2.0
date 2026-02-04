package com.planetapp.renacer.service;

import com.planetapp.renacer.dto.StockMaterialDTO;
import com.planetapp.renacer.model.Bodega;
import com.planetapp.renacer.model.Material;
import com.planetapp.renacer.repository.BodegaRepository;
import com.planetapp.renacer.repository.MaterialRepository;
import com.planetapp.renacer.repository.DetalleEgresoRepository;
import com.planetapp.renacer.repository.DetalleIngresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventarioService {

    private final BodegaRepository bodegaRepository;
    private final MaterialRepository materialRepository;
    private final DetalleIngresoRepository detalleIngresoRepository;
    private final DetalleEgresoRepository detalleEgresoRepository;

    @Autowired
    public InventarioService(BodegaRepository bodegaRepository,
                             MaterialRepository materialRepository,
                             DetalleIngresoRepository detalleIngresoRepository,
                             DetalleEgresoRepository detalleEgresoRepository) {
        this.bodegaRepository = bodegaRepository;
        this.materialRepository = materialRepository;
        this.detalleIngresoRepository = detalleIngresoRepository;
        this.detalleEgresoRepository = detalleEgresoRepository;
    }

    // Método de utilidad (similar al usado en EgresoService)
    private BigDecimal getAvailableStock(Integer idMaterial, Integer idBodega) {
        // Obtenemos los ingresos totales de ese material en esa bodega
        BigDecimal totalIngreso = detalleIngresoRepository.sumCantidadByMaterialAndBodega(idMaterial, idBodega);
        // Obtenemos los egresos totales de ese material de esa bodega
        BigDecimal totalEgreso = detalleEgresoRepository.sumCantidadByMaterialAndBodega(idMaterial, idBodega);

        // Stock = Ingresos - Egresos
        return totalIngreso.subtract(totalEgreso);
    }

    // Lógica para obtener el inventario completo
    public List<StockMaterialDTO> getInventarioActual() {
        List<StockMaterialDTO> inventario = new ArrayList<>();

        // 1. Iterar sobre todas las Bodegas
        List<Bodega> bodegas = bodegaRepository.findAll();
        // 2. Iterar sobre todos los Materiales
        List<Material> materiales = materialRepository.findAll();

        for (Bodega bodega : bodegas) {
            for (Material material : materiales) {

                BigDecimal stock = getAvailableStock(material.getIdMaterial(), bodega.getIdBodega());

                // Solo listamos si el stock es mayor a cero
                if (stock.compareTo(BigDecimal.ZERO) > 0) {
                    inventario.add(new StockMaterialDTO(
                            bodega.getIdBodega(),
                            bodega.getNombre(),
                            material.getIdMaterial(),
                            material.getNombre(),
                            stock
                    ));
                }
            }
        }
        return inventario;
    }
}