package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.Almacenes;
import com.loloyta.service.AlmacenesService;

@RestController
@RequestMapping("/api/almacenes")
public class AlmacenesController {

    @Autowired
    private AlmacenesService almacenesService;

    @GetMapping
    public List<Almacenes> listar() {
        return almacenesService.listarAlmacenes();
    }

    @GetMapping("/{id}")
    public Almacenes obtener(@PathVariable Long id) {
        return almacenesService.obtenerPorId(id).orElseThrow();
    }

    @PostMapping
    public Almacenes crear(@RequestBody Almacenes almacen) {
        return almacenesService.guardarAlmacen(almacen);
    }

    @PutMapping("/{id}")
    public Almacenes actualizar(@PathVariable Long id, @RequestBody Almacenes almacen) {
        return almacenesService.actualizarAlmacen(id, almacen);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        almacenesService.eliminarAlmacen(id);
    }
    
    @GetMapping("/mis-almacenes")
    public List<Almacenes> listarMisAlmacenes() {
        return almacenesService.listarSegunUsuario();
    }
}