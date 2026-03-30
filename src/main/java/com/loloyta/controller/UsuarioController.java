package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.UsuarioAdminUpdateRequest;
import com.loloyta.dto.UsuarioPerfilUpdateRequest;
import com.loloyta.dto.UsuarioResponse;
import com.loloyta.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin("*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listarVisibles();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtenerVisiblePorId(id);
    }

    @PutMapping("/{id}/admin")
    public UsuarioResponse actualizarComoDueno(@PathVariable Long id,
                                               @RequestBody UsuarioAdminUpdateRequest request) {
        return usuarioService.actualizarComoDueno(
                id,
                request.getRolId(),
                request.getNombre(),
                request.getApellido(),
                request.getCorreo(),
                request.getDni(),
                request.getTelefono(),
                request.getUsername(),
                request.getActivo()
        );
    }

    @PutMapping("/{id}/perfil")
    public UsuarioResponse actualizarPerfilPropio(@PathVariable Long id,
                                                  @RequestBody UsuarioPerfilUpdateRequest request) {
        return usuarioService.actualizarPerfilPropio(
                id,
                request.getNombre(),
                request.getApellido(),
                request.getCorreo(),
                request.getDni(),
                request.getTelefono(),
                request.getUsername(),
                request.getPassword()
        );
    }

    @PatchMapping("/{id}/estado")
    public UsuarioResponse cambiarEstado(@PathVariable Long id,
                                         @RequestParam Boolean activo) {
        return usuarioService.cambiarEstado(id, activo);
    }
}