package com.loloyta.service;

import com.loloyta.model.Categorias;

import java.util.List;

public interface CategoriaService {

    List<Categorias> listar();

    Categorias guardar(Categorias categoria);

    Categorias buscarPorId(Long id);

    Categorias actualizar(Long id, Categorias categoria);

    void eliminar(Long id);
}
