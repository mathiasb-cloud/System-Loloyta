package com.loloyta.service;

import com.loloyta.dto.LoginRequest;
import com.loloyta.dto.SesionUsuarioResponse;

public interface AuthService {

    SesionUsuarioResponse login(LoginRequest request);

    SesionUsuarioResponse obtenerSesionActual();
}