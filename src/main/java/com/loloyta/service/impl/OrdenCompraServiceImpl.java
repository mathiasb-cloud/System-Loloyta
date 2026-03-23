package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleOrdenCompra;
import com.loloyta.model.Movimiento;
import com.loloyta.model.OrdenCompra;
import com.loloyta.model.Producto;
import com.loloyta.model.Stock;
import com.loloyta.repository.DetalleOrdenCompraRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.OrdenCompraRepository;
import com.loloyta.repository.StockRepository;
import com.loloyta.service.OrdenCompraService;
import com.loloyta.repository.ProductoRepository;

@Service
public class OrdenCompraServiceImpl implements OrdenCompraService {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private DetalleOrdenCompraRepository detalleRepository;

    @Autowired
    private StockRepository stockRepository;

    @Override
    public List<OrdenCompra> listar() {
        return ordenCompraRepository.findAll();
    }
    @Autowired
    private MovimientoRepository movimientoRepository;

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
        orden.setAlmacenes(ordenActualizada.getAlmacenes());

        return ordenCompraRepository.save(orden);
    }

    @Override
    public OrdenCompra cambiarEstado(Long id, String estado) {

        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        orden.setEstado(estado);

        if (estado.equals("CONFIRMADA")) {

            List<DetalleOrdenCompra> detalles = detalleRepository.findByOrdenCompraId(id);

            BigDecimal total = BigDecimal.ZERO;

            for (DetalleOrdenCompra d : detalles) {
                BigDecimal cantidad = d.getCantidad() != null ? d.getCantidad() : BigDecimal.ZERO;
                BigDecimal precio = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal importe = cantidad.multiply(precio);

                d.setImporteTotal(importe);
                detalleRepository.save(d);

                total = total.add(importe);
            }

            orden.setMontoTotal(total.doubleValue());

            for (DetalleOrdenCompra d : detalles) {

                Producto producto = d.getProducto();

                if (producto != null && d.getPrecioUnitario() != null) {
                    producto.setPrecioActual(d.getPrecioUnitario().doubleValue());
                    productoRepository.save(producto);
                }

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

                stock.setUltimaActualizacion(LocalDateTime.now());

                stockRepository.save(stock);

                Movimiento mov = new Movimiento();
                mov.setTipo("INGRESO");
                mov.setOrdenCompra(orden);
                mov.setCantidad(d.getCantidad());
                mov.setFecha(LocalDateTime.now());
                mov.setUsuario(orden.getUsuario());
                mov.setAlmacen(orden.getAlmacenes());
                mov.setProducto(d.getProducto());

                movimientoRepository.save(mov);
            }
        }

        return ordenCompraRepository.save(orden);
    }
    
}