package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.loloyta.model.DetalleSalida;

public interface DetalleSalidaRepository extends JpaRepository<DetalleSalida, Long> {

    List<DetalleSalida> findBySalidaId(Long salidaId);
    
    void deleteBySalidaId(Long salidaId);
}