package com.loloyta.controller;

import com.loloyta.model.MotivoMerma;
import com.loloyta.service.MotivoMermaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motivos-merma")
public class MotivoMermaController {

    private final MotivoMermaService service;

    public MotivoMermaController(MotivoMermaService service) {
        this.service = service;
    }

    @GetMapping
    public List<MotivoMerma> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public MotivoMerma obtener(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public MotivoMerma crear(@RequestBody MotivoMerma motivo) {
        return service.guardar(motivo);
    }

    @PutMapping("/{id}")
    public MotivoMerma actualizar(@PathVariable Long id, @RequestBody MotivoMerma motivo) {
        return service.actualizar(id, motivo);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}