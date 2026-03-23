package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.DetalleOrdenCompra;
import com.loloyta.service.DetalleOrdenCompraService;

@RestController
@RequestMapping("/api/detalle-orden-compra")
public class DetalleOrdenCompraController {

    @Autowired
    private DetalleOrdenCompraService service;

    @GetMapping
    public List<DetalleOrdenCompra> listar() {
        return service.listar();
    }

    @GetMapping("/orden/{ordenId}")
    public List<DetalleOrdenCompra> listarPorOrden(@PathVariable Long ordenId) {
        return service.listarPorOrden(ordenId);
    }

    @PostMapping
    public DetalleOrdenCompra crear(@RequestBody DetalleOrdenCompra detalle) {
        return service.crear(detalle);
    }

    @PutMapping("/{id}")
    public DetalleOrdenCompra actualizar(@PathVariable Long id, @RequestBody DetalleOrdenCompra detalle) {
        return service.actualizar(id, detalle);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @DeleteMapping("/orden/{ordenId}")
    public void eliminarPorOrden(@PathVariable Long ordenId) {
        service.eliminarPorOrdenId(ordenId);
    }
}