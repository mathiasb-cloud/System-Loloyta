package com.loloyta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.loloyta.model.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByAlmacenesIdAndProductoId(Long almacenId, Long productoId);

}