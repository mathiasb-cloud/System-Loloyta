package com.loloyta.service;

import com.loloyta.dto.LoginRequest;
import com.loloyta.dto.SesionUsuarioResponse;
import com.loloyta.model.Usuario;

public interface AuthService {

    SesionUsuarioResponse login(LoginRequest request);

    SesionUsuarioResponse obtenerSesionActual();

    Usuario obtenerUsuarioAutenticado();
}