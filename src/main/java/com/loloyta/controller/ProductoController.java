package com.loloyta.controller;

import com.loloyta.model.Producto;
import com.loloyta.service.ProductoService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listar(){
        return productoService.listar();
    }

    @GetMapping("/{id}")
    public Producto buscar(@PathVariable Long id){
        return productoService.buscarPorId(id);
    }

    @PostMapping("/create")
    public Producto guardar(@Valid @RequestBody Producto producto){
        return productoService.guardar(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody Producto producto){
        return productoService.actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id){
        productoService.eliminar(id);
    }
    
    @PatchMapping("/{id}/toggle-activo")
    public Producto toggleActivo(@PathVariable Long id) {
        return productoService.toggleActivo(id);
    }

}
