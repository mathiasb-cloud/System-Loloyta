package com.loloyta.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Permiso;
import com.loloyta.model.Usuario;
import com.loloyta.service.AuthService;
import com.loloyta.service.AutorizacionService;

@Service
public class AutorizacionServiceImpl implements AutorizacionService {

    @Autowired
    private AuthService authService;

    @Override
    public void validarPermiso(String permisoCodigo) {
        if (!tienePermiso(permisoCodigo)) {
            throw new RuntimeException("No tiene permisos para realizar esta acción");
        }
    }

    @Override
    public boolean tienePermiso(String permisoCodigo) {
        Usuario usuario = authService.obtenerUsuarioAutenticado();

        if (usuario.getRol() == null || usuario.getRol().getNombre() == null) {
            return false;
        }

        String rolNombre = usuario.getRol().getNombre().toUpperCase();

        if ("MASTER_ADMIN".equals(rolNombre) || "ADMINISTRADOR".equals(rolNombre)) {
            return true;
        }

        if (usuario.getRol().getPermisos() == null) {
            return false;
        }

        return usuario.getRol().getPermisos()
                .stream()
                .map(Permiso::getCodigo)
                .anyMatch(codigo -> codigo.equalsIgnoreCase(permisoCodigo));
    }
}