package com.loloyta.service;

public interface StockLoteService {

    void crearLote(Long productoId, Long almacenId, Double cantidad, Double costoUnitario);

    void descontarFIFO(Long productoId, Long almacenId, Double cantidad);
}