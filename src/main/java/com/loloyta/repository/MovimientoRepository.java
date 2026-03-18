package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.loloyta.model.Movimiento;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByOrdenCompraId(Long ordenId);

    List<Movimiento> findBySalidaId(Long salidaId);

}