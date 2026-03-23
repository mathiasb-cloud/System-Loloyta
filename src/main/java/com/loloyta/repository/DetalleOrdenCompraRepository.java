package com.loloyta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.loloyta.model.DetalleOrdenCompra;

public interface DetalleOrdenCompraRepository extends JpaRepository<DetalleOrdenCompra, Long> {

    List<DetalleOrdenCompra> findByOrdenCompraId(Long ordenId);

    @Transactional
    long deleteByOrdenCompraId(Long ordenId);
}