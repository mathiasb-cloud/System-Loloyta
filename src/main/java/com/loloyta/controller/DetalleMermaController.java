package com.loloyta.controller;

import com.loloyta.model.DetalleMerma;
import com.loloyta.service.DetalleMermaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalle-merma")
public class DetalleMermaController {

    private final DetalleMermaService service;

    public DetalleMermaController(DetalleMermaService service) {
        this.service = service;
    }

    @GetMapping
    public List<DetalleMerma> listar() {
        return service.listar();
    }

    @GetMapping("/merma/{mermaId}")
    public List<DetalleMerma> listarPorMerma(@PathVariable Long mermaId) {
        return service.listarPorMerma(mermaId);
    }

    @PostMapping
    public DetalleMerma crear(@RequestBody DetalleMerma detalle) {
        return service.crear(detalle);
    }

    @PutMapping("/{id}")
    public DetalleMerma actualizar(@PathVariable Long id, @RequestBody DetalleMerma detalle) {
        return service.actualizar(id, detalle);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @DeleteMapping("/merma/{mermaId}")
    public void eliminarPorMerma(@PathVariable Long mermaId) {
        service.eliminarPorMermaId(mermaId);
    }
}