package com.loloyta.service;

import java.util.List;
import java.util.Optional;

import com.loloyta.model.Almacenes;

public interface AlmacenesService {

    List<Almacenes> listarAlmacenes();

    Optional<Almacenes> obtenerPorId(Long id);

    Almacenes guardarAlmacen(Almacenes almacen);

    Almacenes actualizarAlmacen(Long id, Almacenes almacen);

    void eliminarAlmacen(Long id);

}