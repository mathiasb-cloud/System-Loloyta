package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.Almacenes;
import com.loloyta.model.Producto;
import com.loloyta.model.Stock;
import com.loloyta.repository.StockRepository;
import com.loloyta.service.StockService;

@Service
public class StockServiceImpl implements StockService {

    @Autowired
    private StockRepository stockRepository;

    @Override
    public List<Stock> listar() {
        return stockRepository.findAll();
    }

    @Override
    public Stock obtenerPorProductoYAlmacen(Long productoId, Long almacenId) {
        return stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElse(null);
    }

    @Override
    public Stock aumentarStock(Long productoId, Long almacenId, BigDecimal cantidad) {

        Stock stock = stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElse(null);

        if (stock == null) {
            stock = new Stock();

            stock.setCantidad(BigDecimal.ZERO);

            stock.setProducto(new Producto());
            stock.getProducto().setId(productoId);

            stock.setAlmacenes(new Almacenes());
            stock.getAlmacenes().setId(almacenId);
        }

        if (stock.getCantidad() == null) {
            stock.setCantidad(BigDecimal.ZERO);
        }

        stock.setCantidad(stock.getCantidad().add(cantidad));
        stock.setUltimaActualizacion(LocalDateTime.now());

        return stockRepository.save(stock);
    }

    @Override
    public Stock disminuirStock(Long productoId, Long almacenId, BigDecimal cantidad) {

        Stock stock = stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElseThrow(() -> new RuntimeException("Stock no encontrado"));

        if (stock.getCantidad().compareTo(cantidad) < 0) {
            throw new RuntimeException("Stock insuficiente");
        }

        stock.setCantidad(stock.getCantidad().subtract(cantidad));
        stock.setUltimaActualizacion(LocalDateTime.now());

        return stockRepository.save(stock);
    }
}