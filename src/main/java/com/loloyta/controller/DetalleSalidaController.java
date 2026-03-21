package com.loloyta.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
