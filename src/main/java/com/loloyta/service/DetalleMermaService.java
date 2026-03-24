package com.loloyta.service;

import com.loloyta.model.DetalleMerma;

import java.util.List;

public interface DetalleMermaService {

    List<DetalleMerma> listar();

    List<DetalleMerma> listarPorMerma(Long mermaId);

    DetalleMerma crear(DetalleMerma detalle);

    DetalleMerma actualizar(Long id, DetalleMerma detalle);

    void eliminar(Long id);

    void eliminarPorMermaId(Long mermaId);
}