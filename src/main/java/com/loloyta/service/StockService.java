package com.loloyta.service;

import java.math.BigDecimal;
import java.util.List;

import com.loloyta.dto.StockAuditoriaProductoDto;
import com.loloyta.dto.StockAuditoriaRequestDto;
import com.loloyta.model.Stock;

public interface StockService {

    List<Stock> listar();

    List<Stock> listarPorAlmacen(Long almacenId);

    Stock obtenerPorProductoYAlmacen(Long productoId, Long almacenId);

    Stock asignarProductoAAlmacen(Long productoId, Long almacenId, Long proveedorId);

    Stock actualizarProveedor(Long productoId, Long almacenId, Long proveedorId);

    Stock aumentarStock(Long productoId, Long almacenId, BigDecimal cantidad);

    Stock disminuirStock(Long productoId, Long almacenId, BigDecimal cantidad);
    
        BigDecimal calcularValorTotalPorAlmacen(Long almacenId);
    
    List<StockAuditoriaProductoDto> listarAuditoriaPorAlmacen(Long almacenId);

    void guardarAuditoriaAsignacion(StockAuditoriaRequestDto request);

    List<Stock> listarStockBajo();

    List<Stock> listarStockBajoPorAlmacen(Long almacenId);
}