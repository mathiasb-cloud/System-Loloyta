package com.loloyta.service;

import com.loloyta.model.Salida;

import java.util.List;
import java.util.Optional;

public interface SalidaService {

    List<Salida> listar();

    Optional<Salida> obtenerPorId(Long id);

    Salida crear(Salida salida);

    Salida confirmar(Long id);

    Salida actualizar(Long id, Salida salida);

    void eliminar(Long id);
}