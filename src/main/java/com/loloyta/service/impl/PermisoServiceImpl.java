package com.loloyta.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.PermisoResponse;
import com.loloyta.model.Permiso;
import com.loloyta.model.Rol;
import com.loloyta.repository.PermisoRepository;
import com.loloyta.repository.RolRepository;
import com.loloyta.service.PermisoService;

@Service
public class PermisoServiceImpl implements PermisoService {

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private RolRepository rolRepository;

    @Override
    public List<PermisoResponse> listarTodos() {
        return permisoRepository.findAllByOrderByModuloAscAccionAsc()
                .stream()
                .map(p -> toResponse(p, false))
                .toList();
    }

    @Override
    public List<PermisoResponse> listarPorRol(Long rolId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        validarRolVisible(rol);

        Set<Long> permisosAsignados = new HashSet<>();
        if (rol.getPermisos() != null) {
            rol.getPermisos().forEach(p -> permisosAsignados.add(p.getId()));
        }

        return permisoRepository.findAllByOrderByModuloAscAccionAsc()
                .stream()
                .map(p -> toResponse(p, permisosAsignados.contains(p.getId())))
                .toList();
    }

    @Override
    public List<PermisoResponse> actualizarPermisosRol(Long rolId, List<Long> permisoIds) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        validarRolVisible(rol);
        
        if ("ADMINISTRADOR".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("No se pueden modificar los permisos del rol ADMINISTRADOR");
        }

        List<Permiso> permisosNuevos = new ArrayList<>();

        if (permisoIds != null && !permisoIds.isEmpty()) {
            permisosNuevos = permisoRepository.findAllById(permisoIds);

            if (permisosNuevos.size() != permisoIds.size()) {
                throw new RuntimeException("Uno o más permisos no existen");
            }
        }

        rol.setPermisos(permisosNuevos);
        rolRepository.save(rol);

        Set<Long> asignados = new HashSet<>();
        permisosNuevos.forEach(p -> asignados.add(p.getId()));

        return permisoRepository.findAllByOrderByModuloAscAccionAsc()
                .stream()
                .map(p -> toResponse(p, asignados.contains(p.getId())))
                .toList();
    }

    private void validarRolVisible(Rol rol) {
        if ("MASTER_ADMIN".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("El rol solicitado no está disponible");
        }
    }

    private PermisoResponse toResponse(Permiso permiso, boolean asignado) {
        PermisoResponse dto = new PermisoResponse();
        dto.setId(permiso.getId());
        dto.setCodigo(permiso.getCodigo());
        dto.setModulo(permiso.getModulo());
        dto.setAccion(permiso.getAccion());
        dto.setDescripcion(permiso.getDescripcion());
        dto.setActivo(permiso.getActivo());
        dto.setAsignado(asignado);
        return dto;
    }
}