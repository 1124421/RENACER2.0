package com.planetapp.renacer.controller;

import com.planetapp.renacer.dto.StockMaterialDTO;
import com.planetapp.renacer.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    @Autowired
    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    // GET: Obtener el estado actual del inventario
    @GetMapping
    public ResponseEntity<List<StockMaterialDTO>> getInventario() {
        List<StockMaterialDTO> inventario = inventarioService.getInventarioActual();
        return ResponseEntity.ok(inventario);
    }
}