package com.loloyta.service;

import com.loloyta.model.MotivoMerma;
import java.util.List;

public interface MotivoMermaService {

    List<MotivoMerma> listar();

    MotivoMerma buscarPorId(Long id);

    MotivoMerma guardar(MotivoMerma motivo);

    MotivoMerma actualizar(Long id, MotivoMerma motivo);

    void eliminar(Long id);
}