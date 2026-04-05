package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.loloyta.model.DetalleMovimiento;

public interface DetalleMovimientoRepository extends JpaRepository<DetalleMovimiento, Long> {

    List<DetalleMovimiento> findByMovimientoId(Long movimientoId);
}