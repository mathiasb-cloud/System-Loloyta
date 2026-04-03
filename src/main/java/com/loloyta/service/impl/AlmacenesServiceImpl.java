package com.loloyta.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Almacenes;
import com.loloyta.model.Usuario;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.service.AlmacenesService;
import com.loloyta.service.AuthService;

@Service
public class AlmacenesServiceImpl implements AlmacenesService {

    @Autowired
    private AlmacenesRepository almacenesRepository;
    
    @Autowired
    private AuthService authService;

    @Override
    public List<Almacenes> listarAlmacenes() {
        return almacenesRepository.findAll();
    }

    @Override
    public Optional<Almacenes> obtenerPorId(Long id) {
        return almacenesRepository.findById(id);
    }

    @Override
    public Almacenes guardarAlmacen(Almacenes almacen) {
        if (almacen.getFechaCreacion() == null) {
            almacen.setFechaCreacion(LocalDateTime.now());
        }

        if (almacen.getActivo() == null) {
            almacen.setActivo(true);
        }

        return almacenesRepository.save(almacen);
    }

    @Override
    public Almacenes actualizarAlmacen(Long id, Almacenes almacenActualizado) {
        Almacenes almacen = almacenesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Almacen no encontrado"));

        almacen.setNombre(almacenActualizado.getNombre());
        almacen.setUbicacion(almacenActualizado.getUbicacion());
        almacen.setActivo(almacenActualizado.getActivo());

       

        return almacenesRepository.save(almacen);
    }

    @Override
    public void eliminarAlmacen(Long id) {
        almacenesRepository.deleteById(id);
    }
    
    @Override
    public List<Almacenes> listarSegunUsuario() {
        Usuario usuario = authService.obtenerUsuarioAutenticado();

        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String rol = usuario.getRol().getNombre().toUpperCase();

            if ("MASTER_ADMIN".equals(rol) || "ADMINISTRADOR".equals(rol)) {
                return almacenesRepository.findAll();
            }
        }

        return usuario.getAlmacenes() != null ? usuario.getAlmacenes() : List.of();
    }
}