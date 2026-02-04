package com.planetapp.renacer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CostoPromedioDTO {

    private Integer idMaterial;
    private String nombreMaterial;
    private BigDecimal cantidadTotalComprada; // Denominador de la fórmula
    private BigDecimal costoTotalAcumulado; // Numerador de la fórmula
    private BigDecimal costoPromedioPorKg; // Resultado de la división
}