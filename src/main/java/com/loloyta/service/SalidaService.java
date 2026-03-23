package com.loloyta.service;

import java.util.List;
import java.util.Optional;

import com.loloyta.model.Salida;

public interface SalidaService {

    List<Salida> listar();

    Optional<Salida> obtenerPorId(Long id);

    Salida crear(Salida salida);

    Salida actualizar(Long id, Salida salidaActualizada);

    void eliminar(Long id);

    Salida confirmar(Long id);
}