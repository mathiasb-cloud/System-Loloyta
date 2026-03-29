package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.Locales;
import com.loloyta.service.LocalesService;

@RestController
@RequestMapping("/api/locales")
public class LocalesController {

    @Autowired
    private LocalesService localesService;

    @GetMapping
    public List<Locales> listar() {
        return localesService.listarLocales();
    }

    @GetMapping("/{id}")
    public Locales obtener(@PathVariable Long id) {
        return localesService.obtenerPorId(id).orElseThrow();
    }

    @PostMapping
    public Locales crear(@RequestBody Locales local) {
        return localesService.guardarLocal(local);
    }

    @PutMapping("/{id}")
    public Locales actualizar(@PathVariable Long id, @RequestBody Locales local) {
        return localesService.actualizarLocal(id, local);
    }

    @DeleteMapping("/{id}")
    public void desactivar(@PathVariable Long id) {
        localesService.desactivarLocal(id);
    }
    
    @GetMapping("/almacen/{almacenId}")
    public List<Locales> listarPorAlmacen(@PathVariable Long almacenId) {
        return localesService.listarPorAlmacen(almacenId);
    }
}