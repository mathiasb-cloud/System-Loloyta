package com.loloyta.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.loloyta.dto.LoginRequest;
import com.loloyta.dto.SesionUsuarioResponse;
import com.loloyta.model.Permiso;
import com.loloyta.model.Usuario;
import com.loloyta.repository.UsuarioRepository;
import com.loloyta.service.AuthService;

import jakarta.servlet.http.HttpSession;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String SESSION_USER_ID = "SESSION_USER_ID";

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private HttpSession httpSession;

    @Override
    public SesionUsuarioResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("El usuario es obligatorio");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

        if (usuario.getActivo() == null || !usuario.getActivo()) {
            throw new RuntimeException("La cuenta se encuentra desactivada");
        }

        if (usuario.getRol() == null || usuario.getRol().getActivo() == null || !usuario.getRol().getActivo()) {
            throw new RuntimeException("El rol asignado al usuario no se encuentra disponible");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        httpSession.setAttribute(SESSION_USER_ID, usuario.getId());

        return toSesionResponse(usuario);
    }

    @Override
    public SesionUsuarioResponse obtenerSesionActual() {
        Object userId = httpSession.getAttribute(SESSION_USER_ID);

        if (userId == null) {
            throw new RuntimeException("No hay una sesión activa");
        }

        Long id = Long.valueOf(String.valueOf(userId));

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario de sesión no encontrado"));

        if (usuario.getActivo() == null || !usuario.getActivo()) {
            throw new RuntimeException("La cuenta se encuentra desactivada");
        }

        return toSesionResponse(usuario);
    }

    private SesionUsuarioResponse toSesionResponse(Usuario usuario) {
        SesionUsuarioResponse dto = new SesionUsuarioResponse();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setUsername(usuario.getUsername());
        dto.setRol(usuario.getRol() != null ? usuario.getRol().getNombre() : null);

        List<String> permisos = usuario.getRol() != null && usuario.getRol().getPermisos() != null
                ? usuario.getRol().getPermisos().stream()
                    .map(Permiso::getCodigo)
                    .sorted()
                    .toList()
                : List.of();

        dto.setPermisos(permisos);

        return dto;
    }
}