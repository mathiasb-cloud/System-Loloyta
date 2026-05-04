package com.loloyta.repository;

import com.loloyta.model.ConsumoLote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsumoLoteRepository extends JpaRepository<ConsumoLote, Long> {

    List<ConsumoLote> findByTipoMovimientoAndReferenciaId(String tipoMovimiento, Long referenciaId);
}