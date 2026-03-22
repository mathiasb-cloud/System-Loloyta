package com.loloyta.service;

import com.loloyta.model.Producto;

import java.util.List;

public interface ProductoService {

    List<Producto> listar();

    Producto guardar(Producto producto);

    Producto buscarPorId(Long id);

    Producto actualizar(Long id, Producto producto);

    void eliminar(Long id);
    
    Producto toggleActivo(Long id);
}
