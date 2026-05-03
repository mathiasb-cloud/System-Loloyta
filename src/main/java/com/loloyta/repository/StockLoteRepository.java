package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.loloyta.model.StockLote;
public interface StockLoteRepository extends JpaRepository<StockLote, Long> {

    List<StockLote> findByProductoIdAndAlmacenIdAndCantidadDisponibleGreaterThanOrderByFechaIngresoAsc(
        Long productoId,
        Long almacenId,
        Double cantidad
    );
}