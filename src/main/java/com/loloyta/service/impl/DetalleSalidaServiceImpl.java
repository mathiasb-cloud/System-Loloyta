package com.loloyta.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.repository.DetalleSalidaRepository;
import com.loloyta.service.DetalleSalidaService;

@Service
public class DetalleSalidaServiceImpl implements DetalleSalidaService {

    @Autowired
    private DetalleSalidaRepository detalleSalidaRepository;

    @Override
    public void eliminarPorSalidaId(Long salidaId) {
        detalleSalidaRepository.deleteBySalidaId(salidaId);
    }
}