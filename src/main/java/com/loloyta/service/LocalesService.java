package com.loloyta.service;

import java.util.List;
import java.util.Optional;

import com.loloyta.model.Locales;

public interface LocalesService {

    List<Locales> listarLocales();

    Optional<Locales> obtenerPorId(Long id);

    Locales guardarLocal(Locales local);

    Locales actualizarLocal(Long id, Locales local);

    void desactivarLocal(Long id);

}