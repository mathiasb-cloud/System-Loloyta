package com.loloyta.service;

import java.util.List;

import com.loloyta.dto.UsuarioResponse;

public interface UsuarioService {

    List<UsuarioResponse> listarVisibles();

    UsuarioResponse obtenerVisiblePorId(Long id);

    UsuarioResponse actualizarComoDueno(Long id, Long rolId, String nombre, String apellido,
                                        String correo, String dni, String telefono,
                                        String username, Boolean activo);

    UsuarioResponse actualizarPerfilPropio(Long id, String nombre, String apellido,
                                           String correo, String dni, String telefono,
                                           String username, String password);

    UsuarioResponse cambiarEstado(Long id, Boolean activo);
}