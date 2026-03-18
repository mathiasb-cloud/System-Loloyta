package com.loloyta.service;

import java.math.BigDecimal;
import java.util.List;

import com.loloyta.model.Stock;

public interface StockService {

    List<Stock> listar();

    Stock obtenerPorProductoYAlmacen(Long productoId, Long almacenId);

    Stock aumentarStock(Long productoId, Long almacenId, BigDecimal cantidad);

    Stock disminuirStock(Long productoId, Long almacenId, BigDecimal cantidad);

}