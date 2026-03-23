package com.loloyta.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.Salida;
import com.loloyta.service.SalidaService;

@RestController
@RequestMapping("/api/salidas")
public class SalidaController {

    @Autowired
    private SalidaService salidaService;

    @PostMapping
    public Salida crear(@RequestBody Salida salida) {
        return salidaService.crear(salida);
    }

    @PutMapping("/{id}")
    public Salida actualizar(@PathVariable Long id, @RequestBody Salida salida) {
        return salidaService.actualizar(id, salida);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        salidaService.eliminar(id);
    }

    @PatchMapping("/{id}/confirmar")
    public Salida confirmar(@PathVariable Long id) {
        return salidaService.confirmar(id);
    }
}