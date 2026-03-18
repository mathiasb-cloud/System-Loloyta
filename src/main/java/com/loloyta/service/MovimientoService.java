package com.loloyta.service;

import java.math.BigDecimal;
import java.util.List;

import com.loloyta.dto.MovimientoResumenDTO;
import com.loloyta.model.Movimiento;

public interface MovimientoService {

    List<Movimiento> listar();

    List<MovimientoResumenDTO> listarResumen();

    Movimiento registrarIngreso(Long productoId, Long almacenId, BigDecimal cantidad, Long ordenId, Long usuarioId);

    Movimiento registrarSalida(Long productoId, Long almacenId, BigDecimal cantidad, Long salidaId, Long usuarioId);

}