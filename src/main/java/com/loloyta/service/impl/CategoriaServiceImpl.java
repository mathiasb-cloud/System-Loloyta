package com.loloyta.service.impl;

import com.loloyta.model.Categorias;
import com.loloyta.repository.CategoriaRepository;
import com.loloyta.service.CategoriaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public List<Categorias> listar() {
        return categoriaRepository.findAll();
    }

    @Override
    public Categorias guardar(Categorias categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public Categorias buscarPorId(Long id) {
        return categoriaRepository.findById(id).orElse(null);
    }

    @Override
    public Categorias actualizar(Long id, Categorias categoria) {
        Categorias cat = categoriaRepository.findById(id).orElse(null);

        if(cat != null){
            cat.setNombre(categoria.getNombre());
            cat.setDescripcion(categoria.getDescripcion());
            cat.setActivo(categoria.isActivo());
            return categoriaRepository.save(cat);
        }

        return null;
    }

    @Override
    public void eliminar(Long id) {
        categoriaRepository.deleteById(id);
    }
}