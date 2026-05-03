package com.loloyta.service.impl;

import com.loloyta.model.Almacenes;
import com.loloyta.model.Producto;
import com.loloyta.model.StockLote;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.ProductoRepository;
import com.loloyta.repository.StockLoteRepository;
import com.loloyta.service.StockLoteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockLoteServiceImpl implements StockLoteService {

    private final StockLoteRepository stockLoteRepository;
    private final ProductoRepository productoRepository;
    private final AlmacenesRepository almacenesRepository;

    public StockLoteServiceImpl(
            StockLoteRepository stockLoteRepository,
            ProductoRepository productoRepository,
            AlmacenesRepository almacenesRepository
    ) {
        this.stockLoteRepository = stockLoteRepository;
        this.productoRepository = productoRepository;
        this.almacenesRepository = almacenesRepository;
    }

    @Override
    @Transactional
    public void crearLote(Long productoId, Long almacenId, Double cantidad, Double costoUnitario) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Almacenes almacen = almacenesRepository.findById(almacenId)
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        StockLote lote = new StockLote();
        lote.setProducto(producto);
        lote.setAlmacen(almacen);
        lote.setCantidadInicial(cantidad);
        lote.setCantidadDisponible(cantidad);
        lote.setCostoUnitario(costoUnitario);
        lote.setFechaIngreso(LocalDateTime.now());
        lote.setActivo(true);

        stockLoteRepository.save(lote);
    }

    @Override
    @Transactional
    public void descontarFIFO(Long productoId, Long almacenId, Double cantidad) {
        List<StockLote> lotes = stockLoteRepository
                .findByProductoIdAndAlmacenIdAndCantidadDisponibleGreaterThanOrderByFechaIngresoAsc(
                        productoId,
                        almacenId,
                        0.0
                );

        double restante = cantidad;

        for (StockLote lote : lotes) {
            if (restante <= 0) break;

            double disponible = lote.getCantidadDisponible();

            if (disponible <= restante) {
                restante -= disponible;
                lote.setCantidadDisponible(0.0);
                lote.setActivo(false);
            } else {
                lote.setCantidadDisponible(disponible - restante);
                restante = 0;
            }

            stockLoteRepository.save(lote);
        }

        if (restante > 0) {
            throw new RuntimeException("Stock insuficiente por lotes");
        }
    }
}