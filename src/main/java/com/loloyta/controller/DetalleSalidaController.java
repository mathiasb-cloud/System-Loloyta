package com.loloyta.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.model.DetalleSalida;
import com.loloyta.repository.DetalleSalidaRepository;

@RestController
@RequestMapping("/api/detalle-salida")
public class DetalleSalidaController {

    @Autowired
    private DetalleSalidaRepository repository;

    @PostMapping
    public DetalleSalida guardar(@RequestBody DetalleSalida detalle) {
        return repository.save(detalle);
    }

    @DeleteMapping("/salida/{salidaId}")
    public void eliminarPorSalida(@PathVariable Long salidaId) {
        repository.deleteBySalidaId(salidaId);
    }
}