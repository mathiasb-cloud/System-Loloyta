package com.loloyta.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Almacenes;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.service.AlmacenesService;

@Service
public class AlmacenesServiceImpl implements AlmacenesService {

    @Autowired
    private AlmacenesRepository almacenesRepository;

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
}