package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.OrdenCompra;
import com.loloyta.service.OrdenCompraService;

@RestController
@RequestMapping("/api/ordenes-compra")
public class OrdenCompraController {

    @Autowired
    private OrdenCompraService ordenCompraService;

    @GetMapping
    public List<OrdenCompra> listar() {
        return ordenCompraService.listar();
    }

    @GetMapping("/{id}")
    public OrdenCompra obtener(@PathVariable Long id) {
        return ordenCompraService.obtenerPorId(id).orElseThrow();
    }

    @PostMapping
    public OrdenCompra crear(@RequestBody OrdenCompra orden) {
        return ordenCompraService.crear(orden);
    }

    @PutMapping("/{id}")
    public OrdenCompra actualizar(@PathVariable Long id, @RequestBody OrdenCompra orden) {
        return ordenCompraService.actualizar(id, orden);
    }

    @PatchMapping("/{id}/estado")
    public OrdenCompra cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        return ordenCompraService.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        ordenCompraService.eliminar(id);
    }
}