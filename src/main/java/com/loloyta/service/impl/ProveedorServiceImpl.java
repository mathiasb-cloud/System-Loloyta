package com.loloyta.service.impl;

import com.loloyta.model.Proveedor;
import com.loloyta.repository.ProveedorRepository;
import com.loloyta.service.ProveedorService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorServiceImpl(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @Override
    public List<Proveedor> listar() {
        return proveedorRepository.findAll();
    }

    @Override
    public Optional<Proveedor> obtenerPorId(Long id) {
        return proveedorRepository.findById(id);
    }

    @Override
    public Proveedor guardar(Proveedor proveedor) {
        if (proveedor.getFechaCreacion() == null) {
            proveedor.setFechaCreacion(LocalDateTime.now());
        }
        if (proveedor.getActivo() == null) {
            proveedor.setActivo(true);
        }
        return proveedorRepository.save(proveedor);
    }

    @Override
    public Proveedor actualizar(Long id, Proveedor proveedorActualizado) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        proveedor.setNombre(proveedorActualizado.getNombre());
        proveedor.setRuc(proveedorActualizado.getRuc());
        proveedor.setTelefono(proveedorActualizado.getTelefono());
        proveedor.setCorreo(proveedorActualizado.getCorreo());
        proveedor.setDireccion(proveedorActualizado.getDireccion());
        proveedor.setActivo(proveedorActualizado.getActivo());

        return proveedorRepository.save(proveedor);
    }

    @Override
    public void eliminar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }
}