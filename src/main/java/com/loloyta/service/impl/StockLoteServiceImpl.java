package com.loloyta.service.impl;

import com.loloyta.model.Almacenes;
import com.loloyta.model.ConsumoLote;
import com.loloyta.model.Producto;
import com.loloyta.model.StockLote;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.ConsumoLoteRepository;
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
	private final ConsumoLoteRepository consumoLoteRepository;

	public StockLoteServiceImpl(
	        StockLoteRepository stockLoteRepository,
	        ProductoRepository productoRepository,
	        AlmacenesRepository almacenesRepository,
	        ConsumoLoteRepository consumoLoteRepository
	) {
	    this.stockLoteRepository = stockLoteRepository;
	    this.productoRepository = productoRepository;
	    this.almacenesRepository = almacenesRepository;
	    this.consumoLoteRepository = consumoLoteRepository;
	}

    @Override
@Transactional
public void crearLote(Long productoId, Long almacenId, Double cantidad, Double costoUnitario) {
    Producto producto = productoRepository.findById(productoId).orElseThrow();
    Almacenes almacen = almacenesRepository.findById(almacenId).orElseThrow();

    StockLote lote = new StockLote();
    lote.setProducto(producto);
    lote.setAlmacen(almacen);
    lote.setCantidadInicial(cantidad);
    lote.setCantidadDisponible(cantidad);
    lote.setCostoUnitario(costoUnitario);
    
    LocalDateTime ahora = LocalDateTime.now();
    lote.setFechaIngreso(ahora);
    
    // Pruebas lote: Generar un código visual fácil: Ej. Lote-PRD5-20260515
    String fechaFormateada = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd").format(ahora);
    lote.setCodigoLote("LT-P" + producto.getId() + "-" + fechaFormateada);
    
    lote.setActivo(true);
    stockLoteRepository.save(lote);
}

    @Override
    @Transactional
    public void descontarFIFO(Long productoId, Long almacenId, Double cantidad, String tipoMovimiento, Long referenciaId) {
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
            double cantidadConsumida;

            if (disponible <= restante) {
                cantidadConsumida = disponible;
                restante -= disponible;
                lote.setCantidadDisponible(0.0);
                lote.setActivo(false);
            } else {
                cantidadConsumida = restante;
                lote.setCantidadDisponible(disponible - restante);
                restante = 0;
            }

            stockLoteRepository.save(lote);

            ConsumoLote consumo = new ConsumoLote();
            consumo.setLote(lote);
            consumo.setProducto(lote.getProducto());
            consumo.setAlmacen(lote.getAlmacen());
            consumo.setTipoMovimiento(tipoMovimiento);
            consumo.setReferenciaId(referenciaId);
            consumo.setCantidad(cantidadConsumida);
            consumo.setCostoUnitario(lote.getCostoUnitario());
            consumo.setFecha(LocalDateTime.now());

            consumoLoteRepository.save(consumo);
        }

        if (restante > 0) {
            throw new RuntimeException("Stock insuficiente por lotes");
        }
    }
    
    @Override
    @Transactional
    public void consumirLoteEspecifico(Long loteId, Double cantidad, String tipoMovimiento, Long referenciaId) {
        StockLote lote = stockLoteRepository.findById(loteId)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));

        if (lote.getCantidadDisponible() < cantidad) {
            
            throw new RuntimeException("Stock insuficiente en el lote especificado. Disponible: " + lote.getCantidadDisponible());
        }

        
        lote.setCantidadDisponible(lote.getCantidadDisponible() - cantidad);
        
        
        if (lote.getCantidadDisponible() == 0) {
            lote.setActivo(false);
        }
        
        stockLoteRepository.save(lote);

        
        ConsumoLote consumo = new ConsumoLote();
        consumo.setLote(lote);
        consumo.setProducto(lote.getProducto());
        consumo.setAlmacen(lote.getAlmacen());
        consumo.setTipoMovimiento(tipoMovimiento);
        consumo.setReferenciaId(referenciaId);
        consumo.setCantidad(cantidad);
        consumo.setCostoUnitario(lote.getCostoUnitario());
        consumo.setFecha(LocalDateTime.now());

        consumoLoteRepository.save(consumo);
    }
}