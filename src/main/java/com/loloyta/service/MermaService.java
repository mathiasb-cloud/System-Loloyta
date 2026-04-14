package com.loloyta.service;

import com.loloyta.model.Merma;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MermaService {

    List<Merma> listar();

    Optional<Merma> obtenerPorId(Long id);

    Merma crear(Merma merma);

    Merma actualizar(Long id, Merma mermaActualizada);

    Merma confirmar(Long id);

    void eliminar(Long id);
    
    Map<String, Object> obtenerResumenDashboard();
}