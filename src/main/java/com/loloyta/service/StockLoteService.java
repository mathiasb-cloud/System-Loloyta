package com.loloyta.service;

public interface StockLoteService {

    void crearLote(Long productoId, Long almacenId, Double cantidad, Double costoUnitario);

    void consumirLoteEspecifico(Long loteId, Double cantidad, String tipoMovimiento, Long referenciaId);
    void descontarFIFO(Long productoId, Long almacenId, Double cantidad, String tipoMovimiento, Long referenciaId);
}