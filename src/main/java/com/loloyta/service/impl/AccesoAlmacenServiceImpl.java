package com.loloyta.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Usuario;
import com.loloyta.service.AccesoAlmacenService;
import com.loloyta.service.AuthService;

@Service
public class AccesoAlmacenServiceImpl implements AccesoAlmacenService {

    @Autowired
    private AuthService authService;

    @Override
    public void validarAccesoAlmacen(Long almacenId) {
        Usuario usuario = authService.obtenerUsuarioAutenticado();

        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String rol = usuario.getRol().getNombre().toUpperCase();
            if ("MASTER_ADMIN".equals(rol) || "ADMINISTRADOR".equals(rol)) {
                return;
            }
        }

        boolean permitido = usuario.getAlmacenes() != null &&
                usuario.getAlmacenes().stream().anyMatch(a -> a.getId().equals(almacenId));

        if (!permitido) {
            throw new RuntimeException("No tiene acceso a ese almacén");
        }
    }

    @Override
    public boolean puedeSalidaEntreAlmacenes() {
        Usuario usuario = authService.obtenerUsuarioAutenticado();

        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String rol = usuario.getRol().getNombre().toUpperCase();
            if ("MASTER_ADMIN".equals(rol) || "ADMINISTRADOR".equals(rol)) {
                return true;
            }
        }

        return usuario.getPuedeSalidaEntreAlmacenes() != null && usuario.getPuedeSalidaEntreAlmacenes();
    }
}