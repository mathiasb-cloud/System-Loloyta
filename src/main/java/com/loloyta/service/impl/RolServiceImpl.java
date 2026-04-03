package com.loloyta.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.RolResponse;
import com.loloyta.model.Permiso;
import com.loloyta.model.Rol;
import com.loloyta.repository.PermisoRepository;
import com.loloyta.repository.RolRepository;
import com.loloyta.service.RolService;

@Service
public class RolServiceImpl implements RolService {

    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PermisoRepository permisoRepository;

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
    
    
    @Override
    public RolResponse actualizarNombre(Long id, String nombre) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if ("MASTER_ADMIN".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("El rol solicitado no está disponible");
        }

        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }

        rol.setNombre(nombre.trim());

        return toResponse(rolRepository.save(rol));
    }
    
    @Override
    public RolResponse crear(String nombre, String descripcion) {
        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }

        if (rolRepository.existsByNombre(nombre.trim())) {
            throw new RuntimeException("Ya existe un rol con ese nombre");
        }

        Rol rol = new Rol();
        rol.setNombre(nombre.trim());
        rol.setDescripcion((descripcion == null || descripcion.isBlank()) ? null : descripcion.trim());
        rol.setActivo(true);
        rol.setEsSistema(false);

        Rol guardado = rolRepository.save(rol);

        List<String> codigosPermitidos = List.of(
            "DASHBOARD_VER",
            "PRODUCTOS_VER",
            "PRODUCTOS_EDITAR",
            "ORDENES_VER",
            "ORDENES_CREAR",
            "ORDENES_CONFIRMAR",
            "SALIDAS_VER",
            "SALIDAS_CREAR",
            "SALIDAS_CONFIRMAR",
            "MERMAS_VER",
            "MERMAS_CREAR",
            "MERMAS_CONFIRMAR",
            "STOCK_VER",
            "STOCK_ASIGNAR",
            "STOCK_AUDITAR",
            "LOCALES_VER"
        );

        List<Permiso> permisosBase = permisoRepository.findAll().stream()
                .filter(p -> codigosPermitidos.contains(p.getCodigo()))
                .toList();

        guardado.setPermisos(permisosBase);
        guardado = rolRepository.save(guardado);

        return toResponse(guardado);
    }
}