package com.loloyta.service;

import java.util.List;

import com.loloyta.dto.RolResponse;

public interface RolService {

    List<RolResponse> listarVisibles();
    
    RolResponse actualizarNombre(Long id, String nombre);
}