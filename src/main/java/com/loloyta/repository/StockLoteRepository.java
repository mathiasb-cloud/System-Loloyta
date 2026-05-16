package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.loloyta.model.StockLote;
public interface StockLoteRepository extends JpaRepository<StockLote, Long> {

    List<StockLote> findByProductoIdAndAlmacenIdAndCantidadDisponibleGreaterThanOrderByFechaIngresoAsc(
        Long productoId,
        Long almacenId,
        Double cantidad
    );
    
 // Pruebas lote: Para saber el valor en dinero real de un producto en un almacén
    @Query("SELECT SUM(l.cantidadDisponible * l.costoUnitario) FROM StockLote l WHERE l.producto.id = :productoId AND l.almacen.id = :almacenId AND l.cantidadDisponible > 0")
    Double calcularCostoRealStockPorProducto(@Param("productoId") Long productoId, @Param("almacenId") Long almacenId);
}
