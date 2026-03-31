package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.RolNombreUpdateRequest;
import com.loloyta.dto.RolResponse;
import com.loloyta.service.AutorizacionService;
import com.loloyta.service.RolService;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin("*")
public class RolController {

    @Autowired
    private RolService rolService;
    
    @Autowired
    private AutorizacionService autorizacionService;

    @GetMapping
    public List<RolResponse> listar() {
    	autorizacionService.validarPermiso("ROLES_VER");
        return rolService.listarVisibles();
    }
    
    
    @PatchMapping("/{id}/nombre")
    public RolResponse actualizarNombre(@PathVariable Long id,
                                        @RequestBody RolNombreUpdateRequest request) {
    	autorizacionService.validarPermiso("ROLES_EDITAR");
        return rolService.actualizarNombre(id, request.getNombre());
    }
}