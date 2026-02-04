package com.planetapp.renacer.controller;

import com.planetapp.renacer.dto.BarrioDesempenoDTO;
import com.planetapp.renacer.dto.CostoPromedioDTO;
import com.planetapp.renacer.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    @Autowired
    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    // GET: Desempeño de recolección por Barrio/Ruta
    @GetMapping("/desempeno-barrio")
    public ResponseEntity<List<BarrioDesempenoDTO>> getDesempenoBarrio() {
        return ResponseEntity.ok(reporteService.getDesempenoBarrio());
    }
    // NUEVO GET: Costo promedio por material
    @GetMapping("/costo-promedio")
    public ResponseEntity<List<CostoPromedioDTO>> getCostoPromedioMateriales() {
        return ResponseEntity.ok(reporteService.getCostoPromedioMateriales());
    }
}