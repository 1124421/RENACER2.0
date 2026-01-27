package com.planetapp.renacer.service;

import com.planetapp.renacer.dto.BarrioDesempenoDTO;
import com.planetapp.renacer.dto.CostoPromedioDTO; // NUEVA IMPORTACIÓN
import com.planetapp.renacer.repository.EncabezadoIngresoRepository;
import com.planetapp.renacer.repository.DetalleIngresoRepository; // NUEVA IMPORTACIÓN
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    private final EncabezadoIngresoRepository encabezadoIngresoRepository;
    private final DetalleIngresoRepository detalleIngresoRepository; // NUEVA INYECCIÓN

    @Autowired
    public ReporteService(EncabezadoIngresoRepository encabezadoIngresoRepository,
                          DetalleIngresoRepository detalleIngresoRepository) { // AÑADIR A CONSTRUCTOR
        this.encabezadoIngresoRepository = encabezadoIngresoRepository;
        this.detalleIngresoRepository = detalleIngresoRepository;
    }

    public List<BarrioDesempenoDTO> getDesempenoBarrio() {
        return encabezadoIngresoRepository.getDesempenoPorBarrio();
    }

    // NUEVO MÉTODO: Calcular Costo Promedio Ponderado
    public List<CostoPromedioDTO> getCostoPromedioMateriales() {
        // Obtenemos los resultados de la consulta (idMaterial, nombreMaterial, sumaCantidad, sumaCosto)
        List<Object[]> resultados = detalleIngresoRepository.getCostoYCantidadTotalPorMaterial();

        return resultados.stream().map(row -> {
            Integer idMaterial = (Integer) row[0];
            String nombreMaterial = (String) row[1];
            BigDecimal cantidadTotal = (BigDecimal) row[2];
            BigDecimal costoTotal = (BigDecimal) row[3];

            BigDecimal costoPromedio;
            if (cantidadTotal.compareTo(BigDecimal.ZERO) > 0) {
                // Costo Promedio = Costo Total / Cantidad Total
                costoPromedio = costoTotal.divide(cantidadTotal, 2, RoundingMode.HALF_UP);
            } else {
                costoPromedio = BigDecimal.ZERO;
            }

            return new CostoPromedioDTO(
                    idMaterial,
                    nombreMaterial,
                    cantidadTotal,
                    costoTotal,
                    costoPromedio
            );
        }).collect(Collectors.toList());
    }
}