package com.loloyta.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.RolResponse;
import com.loloyta.model.Rol;
import com.loloyta.repository.RolRepository;
import com.loloyta.service.RolService;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public List<RolResponse> listarVisibles() {
        return rolRepository.findByNombreNot("MASTER_ADMIN")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RolResponse toResponse(Rol rol) {
        RolResponse dto = new RolResponse();
        dto.setId(rol.getId());
        dto.setNombre(rol.getNombre());
        dto.setDescripcion(rol.getDescripcion());
        dto.setActivo(rol.getActivo());
        dto.setEsSistema(rol.getEsSistema());
        return dto;
    }
}