package com.loloyta.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.StockAuditoriaProductoDto;
import com.loloyta.dto.StockAuditoriaRequestDto;
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

    @GetMapping("/almacen/{almacenId}")
    public List<Stock> listarPorAlmacen(@PathVariable Long almacenId) {
        return stockService.listarPorAlmacen(almacenId);
    }

    @GetMapping("/buscar")
    public Stock obtener(@RequestParam Long productoId, @RequestParam Long almacenId) {
        return stockService.obtenerPorProductoYAlmacen(productoId, almacenId);
    }

    @PostMapping("/asignar")
    public Stock asignarProductoAAlmacen(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam(required = false) Long proveedorId) {

        return stockService.asignarProductoAAlmacen(productoId, almacenId, proveedorId);
    }

    @PatchMapping("/proveedor")
    public Stock actualizarProveedor(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam(required = false) Long proveedorId) {

        return stockService.actualizarProveedor(productoId, almacenId, proveedorId);
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
    
    @GetMapping("/auditoria/{almacenId}")
    public List<StockAuditoriaProductoDto> listarAuditoria(@PathVariable Long almacenId) {
        return stockService.listarAuditoriaPorAlmacen(almacenId);
    }

    @PostMapping("/auditoria/guardar")
    public void guardarAuditoria(@RequestBody StockAuditoriaRequestDto request) {
        stockService.guardarAuditoriaAsignacion(request);
    }

    @GetMapping("/stock-bajo")
    public List<Stock> listarStockBajo() {
        return stockService.listarStockBajo();
    }

    @GetMapping("/stock-bajo/almacen/{almacenId}")
    public List<Stock> listarStockBajoPorAlmacen(@PathVariable Long almacenId) {
        return stockService.listarStockBajoPorAlmacen(almacenId);
    }
}