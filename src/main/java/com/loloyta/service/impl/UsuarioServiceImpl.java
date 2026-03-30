package com.loloyta.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.loloyta.dto.UsuarioResponse;
import com.loloyta.model.Rol;
import com.loloyta.model.Usuario;
import com.loloyta.repository.RolRepository;
import com.loloyta.repository.UsuarioRepository;
import com.loloyta.service.UsuarioService;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UsuarioResponse> listarVisibles() {
        return usuarioRepository.findByRolNombreNot("MASTER_ADMIN")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioResponse obtenerVisiblePorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarNoMasterAdmin(usuario);
        return toResponse(usuario);
    }

    @Override
    public UsuarioResponse actualizarComoDueno(Long id, Long rolId, String nombre, String apellido,
                                               String correo, String dni, String telefono,
                                               String username, Boolean activo) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarNoMasterAdmin(usuario);

        if (rolId == null) {
            throw new RuntimeException("Debe seleccionar un rol");
        }

        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if ("MASTER_ADMIN".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("No se puede asignar el rol MASTER_ADMIN desde la interfaz");
        }

        validarUsernameUnico(username, usuario.getId());
        validarCorreoUnico(correo, usuario.getId());
        validarDniUnico(dni, usuario.getId());

        usuario.setNombre(normalizar(nombre));
        usuario.setApellido(normalizar(apellido));
        usuario.setCorreo(normalizarNullable(correo));
        usuario.setDni(normalizarNullable(dni));
        usuario.setTelefono(normalizarNullable(telefono));
        usuario.setUsername(normalizar(username));
        usuario.setActivo(activo != null ? activo : true);
        usuario.setRol(rol);

        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponse actualizarPerfilPropio(Long id, String nombre, String apellido,
                                                  String correo, String dni, String telefono,
                                                  String username, String password) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarNoMasterAdmin(usuario);

        validarUsernameUnico(username, usuario.getId());
        validarCorreoUnico(correo, usuario.getId());
        validarDniUnico(dni, usuario.getId());

        usuario.setNombre(normalizar(nombre));
        usuario.setApellido(normalizar(apellido));
        usuario.setCorreo(normalizarNullable(correo));
        usuario.setDni(normalizarNullable(dni));
        usuario.setTelefono(normalizarNullable(telefono));
        usuario.setUsername(normalizar(username));

        if (password != null && !password.isBlank()) {
            if (passwordEncoder != null) {
                usuario.setPassword(passwordEncoder.encode(password));
            } else {
                usuario.setPassword(password);
            }
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioResponse cambiarEstado(Long id, Boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarNoMasterAdmin(usuario);

        usuario.setActivo(activo != null ? activo : false);

        return toResponse(usuarioRepository.save(usuario));
    }

    private void validarNoMasterAdmin(Usuario usuario) {
        if (usuario.getRol() != null && "MASTER_ADMIN".equalsIgnoreCase(usuario.getRol().getNombre())) {
            throw new RuntimeException("El usuario solicitado no está disponible");
        }
    }

    private void validarUsernameUnico(String username, Long usuarioIdActual) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("El nombre de usuario es obligatorio");
        }

        usuarioRepository.findByUsername(username.trim())
                .ifPresent(existente -> {
                    if (!existente.getId().equals(usuarioIdActual)) {
                        throw new RuntimeException("El nombre de usuario ya está en uso");
                    }
                });
    }

    private void validarCorreoUnico(String correo, Long usuarioIdActual) {
        if (correo == null || correo.isBlank()) return;

        List<Usuario> usuarios = usuarioRepository.findAll();
        for (Usuario u : usuarios) {
            if (u.getCorreo() != null
                    && u.getCorreo().equalsIgnoreCase(correo.trim())
                    && !u.getId().equals(usuarioIdActual)) {
                throw new RuntimeException("El correo ya está en uso");
            }
        }
    }

    private void validarDniUnico(String dni, Long usuarioIdActual) {
        if (dni == null || dni.isBlank()) return;

        List<Usuario> usuarios = usuarioRepository.findAll();
        for (Usuario u : usuarios) {
            if (u.getDni() != null
                    && u.getDni().equalsIgnoreCase(dni.trim())
                    && !u.getId().equals(usuarioIdActual)) {
                throw new RuntimeException("El DNI ya está en uso");
            }
        }
    }

    private String normalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new RuntimeException("Hay campos obligatorios vacíos");
        }
        return valor.trim();
    }

    private String normalizarNullable(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        UsuarioResponse dto = new UsuarioResponse();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setCorreo(usuario.getCorreo());
        dto.setDni(usuario.getDni());
        dto.setTelefono(usuario.getTelefono());
        dto.setUsername(usuario.getUsername());
        dto.setActivo(usuario.getActivo());
        dto.setRolNombre(usuario.getRol() != null ? usuario.getRol().getNombre() : null);
        return dto;
    }
}