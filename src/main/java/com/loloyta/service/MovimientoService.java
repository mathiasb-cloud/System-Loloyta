package com.loloyta.service;

import java.math.BigDecimal;
import java.util.List;

import com.loloyta.dto.MovimientoDetalleDto;
import com.loloyta.dto.MovimientoResumenDto;
import com.loloyta.model.Movimiento;

public interface MovimientoService {

    List<Movimiento> listar();

    List<MovimientoResumenDto> listarResumen();

    MovimientoDetalleDto obtenerDetallePorReferencia(String referencia);

    Movimiento registrarIngreso(Long productoId, Long almacenId, BigDecimal cantidad, Long ordenId, Long usuarioId);

    Movimiento registrarSalida(Long productoId, Long almacenId, BigDecimal cantidad, Long salidaId, Long usuarioId);
}