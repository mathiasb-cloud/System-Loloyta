package com.loloyta.controller;

import com.loloyta.model.Categorias;
import com.loloyta.service.CategoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping("/listar")
    public List<Categorias> listar(){
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public Categorias buscar(@PathVariable Long id){
        return categoriaService.buscarPorId(id);
    }

    @PostMapping("/create")
    public Categorias guardar(@RequestBody Categorias categoria){
        return categoriaService.guardar(categoria);
    }

    @PutMapping("/{id}")
    public Categorias actualizar(@PathVariable Long id, @RequestBody Categorias categoria){
        return categoriaService.actualizar(id, categoria);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id){
        categoriaService.eliminar(id);
    }
}
