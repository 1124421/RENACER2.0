package com.planetapp.renacer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMaterialDTO {

    private Integer idBodega;
    private String nombreBodega;
    private Integer idMaterial;
    private String nombreMaterial;
    private BigDecimal stockDisponible;
}