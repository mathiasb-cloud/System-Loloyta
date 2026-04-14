package com.loloyta.controller;

import com.loloyta.model.Merma;
import com.loloyta.service.MermaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mermas")
public class MermaController {

    private final MermaService mermaService;

    public MermaController(MermaService mermaService) {
        this.mermaService = mermaService;
    }

    @GetMapping
    public List<Merma> listar() {
        return mermaService.listar();
    }

    @GetMapping("/{id}")
    public Merma obtener(@PathVariable Long id) {
        return mermaService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Merma no encontrada"));
    }

    @PostMapping
    public Merma crear(@RequestBody Merma merma) {
        return mermaService.crear(merma);
    }

    @PutMapping("/{id}")
    public Merma actualizar(@PathVariable Long id, @RequestBody Merma merma) {
        return mermaService.actualizar(id, merma);
    }

    @PatchMapping("/{id}/confirmar")
    public Merma confirmar(@PathVariable Long id) {
        return mermaService.confirmar(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        mermaService.eliminar(id);
    }
    
    @GetMapping("/resumen-dashboard")
    public Map<String, Object> resumenDashboard() {
        return mermaService.obtenerResumenDashboard();
    }
}