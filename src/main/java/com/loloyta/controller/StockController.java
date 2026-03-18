package com.loloyta.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.Stock;
import com.loloyta.service.StockService;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    public List<Stock> listar() {
        return stockService.listar();
    }

    @GetMapping
    @RequestMapping("/buscar")
    public Stock obtener(@RequestParam Long productoId, @RequestParam Long almacenId) {
        return stockService.obtenerPorProductoYAlmacen(productoId, almacenId);
    }

    @PostMapping("/aumentar")
    public Stock aumentar(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam BigDecimal cantidad) {

        return stockService.aumentarStock(productoId, almacenId, cantidad);
    }

    @PostMapping("/disminuir")
    public Stock disminuir(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam BigDecimal cantidad) {

        return stockService.disminuirStock(productoId, almacenId, cantidad);
    }
}