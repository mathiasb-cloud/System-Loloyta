package com.loloyta.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PatchMapping("/{id}/confirmar")
    public Salida confirmar(@PathVariable Long id) {
        return salidaService.confirmar(id);
    }
}