package com.planetapp.renacer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BarrioDesempenoDTO {

    private Integer idBarrio;
    private String nombreBarrio;
    private BigDecimal totalMaterialIngresadoKg;
    private Long cantidadTransacciones;
}