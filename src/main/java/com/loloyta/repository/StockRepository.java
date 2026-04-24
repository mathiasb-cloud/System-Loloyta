package com.loloyta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.loloyta.model.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByAlmacenesIdAndProductoId(Long almacenId, Long productoId);

    List<Stock> findByAlmacenesId(Long almacenId);

    List<Stock> findByProductoId(Long productoId);
    
    void deleteByAlmacenesIdAndProductoId(Long almacenId, Long productoId);

    @Query("SELECT COALESCE(SUM(s.cantidad * COALESCE(s.producto.precioActual, 0)), 0) FROM Stock s WHERE s.almacenes.id = :almacenId")
    java.math.BigDecimal calcularValorTotalPorAlmacen(@Param("almacenId") Long almacenId);
}