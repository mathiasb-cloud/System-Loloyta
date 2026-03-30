package com.loloyta.service;

import java.util.List;

import com.loloyta.dto.PermisoResponse;

public interface PermisoService {

    List<PermisoResponse> listarTodos();

    List<PermisoResponse> listarPorRol(Long rolId);

    List<PermisoResponse> actualizarPermisosRol(Long rolId, List<Long> permisoIds);
}