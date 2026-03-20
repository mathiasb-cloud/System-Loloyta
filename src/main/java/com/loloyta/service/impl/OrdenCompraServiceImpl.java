package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleOrdenCompra;
import com.loloyta.model.OrdenCompra;
import com.loloyta.model.Stock;
import com.loloyta.repository.DetalleOrdenCompraRepository;
import com.loloyta.repository.OrdenCompraRepository;
import com.loloyta.repository.StockRepository;
import com.loloyta.service.OrdenCompraService;

@Service
public class OrdenCompraServiceImpl implements OrdenCompraService {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;
    
    @Autowired
    private DetalleOrdenCompraRepository detalleRepository;

    @Autowired
    private StockRepository stockRepository;

    @Override
    public List<OrdenCompra> listar() {
        return ordenCompraRepository.findAll();
    }

    @Override
    public Optional<OrdenCompra> obtenerPorId(Long id) {
        return ordenCompraRepository.findById(id);
    }

    @Override
    public OrdenCompra crear(OrdenCompra orden) {
        orden.setEstado("PENDIENTE"); 
        return ordenCompraRepository.save(orden);
    }

    @Override
    public OrdenCompra actualizar(Long id, OrdenCompra ordenActualizada) {

        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        orden.setMetodoPago(ordenActualizada.getMetodoPago());
        orden.setMontoTotal(ordenActualizada.getMontoTotal());
        orden.setAlmacenes(ordenActualizada.getAlmacenes());

        return ordenCompraRepository.save(orden);
    }

    @Override
    public OrdenCompra cambiarEstado(Long id, String estado) {

        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        orden.setEstado(estado);

        if (estado.equals("CONFIRMADA")) {

            List<DetalleOrdenCompra> detalles =
                    detalleRepository.findByOrdenCompraId(id);

            for (DetalleOrdenCompra d : detalles) {

                Stock stock = stockRepository
                        .findByAlmacenesIdAndProductoId(
                                orden.getAlmacenes().getId(),
                                d.getProducto().getId()
                        )
                        .orElse(null);

                if (stock == null) {
                    stock = new Stock();
                    stock.setAlmacenes(orden.getAlmacenes());
                    stock.setProducto(d.getProducto());
                    stock.setCantidad(BigDecimal.ZERO);
                }

                if (stock.getCantidad() == null) {
                    stock.setCantidad(BigDecimal.ZERO);
                }

                stock.setCantidad(
                        stock.getCantidad().add(d.getCantidad())
                );

                stock.setUltimaActualizacion(java.time.LocalDateTime.now());

                stockRepository.save(stock);
            }
        }

        return ordenCompraRepository.save(orden);
    }
}