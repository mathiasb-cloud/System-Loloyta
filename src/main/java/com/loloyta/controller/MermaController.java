package com.loloyta.controller;

import com.loloyta.model.DetalleMerma;
import com.loloyta.model.Merma;
import com.loloyta.service.DetalleMermaService;
import com.loloyta.service.MermaService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mermas")
public class MermaController {

    private final MermaService mermaService;
    private final DetalleMermaService detalleMermaService;

    public MermaController(MermaService mermaService,
                           DetalleMermaService detalleMermaService) {
        this.mermaService = mermaService;
        this.detalleMermaService = detalleMermaService;
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
@GetMapping("/{id}/detalle")
    public List<Map<String, Object>> obtenerDetalle(@PathVariable Long id) {

        List<DetalleMerma> detalles = detalleMermaService.listarPorMerma(id);

        List<Map<String, Object>> lista = new ArrayList<>();

        for (DetalleMerma d : detalles) {

            Map<String, Object> item = new HashMap<>();

            item.put("productoNombre", d.getProducto().getNombre());
            item.put("cantidad", d.getCantidad());

            if (d.getMotivo() != null) {
                item.put("motivoNombre", d.getMotivo().getNombre());
            } else {
                item.put("motivoNombre", "-");
            }

            lista.add(item);
        }

        return lista;
    }

    
    
}