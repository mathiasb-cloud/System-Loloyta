package com.loloyta.controller;

import com.loloyta.model.StockLote;
import com.loloyta.repository.StockLoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
public class StockLoteController {

    @Autowired
    private StockLoteRepository stockLoteRepository;

    @GetMapping("/disponibles")
    public List<StockLote> obtenerLotesDisponibles(
            @RequestParam Long productoId, 
            @RequestParam Long almacenId) {
            
        return stockLoteRepository
                .findByProductoIdAndAlmacenIdAndCantidadDisponibleGreaterThanOrderByFechaIngresoAsc(
                        productoId, almacenId, 0.0);
    }
}