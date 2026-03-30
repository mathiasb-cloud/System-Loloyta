package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.PermisoResponse;
import com.loloyta.dto.RolPermisosUpdateRequest;
import com.loloyta.service.PermisoService;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin("*")
public class PermisoController {

    @Autowired
    private PermisoService permisoService;

    @GetMapping
    public List<PermisoResponse> listarTodos() {
        return permisoService.listarTodos();
    }

    @GetMapping("/rol/{rolId}")
    public List<PermisoResponse> listarPorRol(@PathVariable Long rolId) {
        return permisoService.listarPorRol(rolId);
    }

    @PutMapping("/rol/{rolId}")
    public List<PermisoResponse> actualizarPermisosRol(@PathVariable Long rolId,
                                                       @RequestBody RolPermisosUpdateRequest request) {
        return permisoService.actualizarPermisosRol(rolId, request.getPermisoIds());
    }
}