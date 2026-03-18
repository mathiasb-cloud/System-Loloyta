package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.MovimientoResumenDTO;
import com.loloyta.model.Movimiento;
import com.loloyta.service.MovimientoService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    @Autowired
    private MovimientoService service;

    @GetMapping
    public List<Movimiento> listar() {
        return service.listar();
    }

   
    @GetMapping("/resumen")
    public List<MovimientoResumenDTO> resumen() {
        return service.listarResumen();
    }
}