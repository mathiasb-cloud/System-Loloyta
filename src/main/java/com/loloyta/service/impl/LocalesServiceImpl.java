package com.loloyta.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Locales;
import com.loloyta.repository.LocalesRepository;
import com.loloyta.service.LocalesService;

@Service
public class LocalesServiceImpl implements LocalesService {

    @Autowired
    private LocalesRepository localesRepository;

    @Override
    public List<Locales> listarLocales() {
        return localesRepository.findAll();
    }

    @Override
    public Optional<Locales> obtenerPorId(Long id) {
        return localesRepository.findById(id);
    }

    @Override
    public Locales guardarLocal(Locales local) {
        return localesRepository.save(local);
    }

    @Override
    public Locales actualizarLocal(Long id, Locales localActualizado) {

        Locales local = localesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Local no encontrado"));

        local.setNombre(localActualizado.getNombre());
        local.setUbicacion(localActualizado.getUbicacion());
        local.setActivo(localActualizado.getActivo());

        return localesRepository.save(local);
    }

    @Override
    public void desactivarLocal(Long id) {

        Locales local = localesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Local no encontrado"));

        local.setActivo(false);

        localesRepository.save(local);
    }
}