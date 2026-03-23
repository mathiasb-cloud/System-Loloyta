package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.MovimientoDetalleDto;
import com.loloyta.dto.MovimientoResumenDto;
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
    public List<MovimientoResumenDto> resumen() {
        return service.listarResumen();
    }
    
    @GetMapping("/detalle/{referencia}")
    public MovimientoDetalleDto detalle(@PathVariable String referencia) {
        return service.obtenerDetallePorReferencia(referencia);
    }
    
    @GetMapping("/detalle")
    public String detalleMovimiento() {
        return "detalle-movimiento";
    }
}