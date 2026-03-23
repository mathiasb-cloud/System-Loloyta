package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private MovimientoRepository movimientoRepository;

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
        if (orden.getFecha() == null) {
            orden.setFecha(LocalDateTime.now());
        }
        if (orden.getMontoTotal() == null) {
            orden.setMontoTotal(0.0);
        }
        return ordenCompraRepository.save(orden);
    }

    @Override
    public OrdenCompra actualizar(Long id, OrdenCompra ordenActualizada) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(orden.getEstado())) {
            throw new RuntimeException("Solo se puede editar una orden en estado PENDIENTE");
        }

        orden.setAlmacenes(ordenActualizada.getAlmacenes());
        orden.setUsuario(ordenActualizada.getUsuario());

        return ordenCompraRepository.save(orden);
    }

    @Override
    @Transactional
    public OrdenCompra cambiarEstado(Long id, String estado) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if ("CONFIRMADA".equalsIgnoreCase(orden.getEstado())) {
            return orden;
        }

        if (!"CONFIRMADA".equalsIgnoreCase(estado)) {
            orden.setEstado(estado);
            return ordenCompraRepository.save(orden);
        }

        List<DetalleOrdenCompra> detalles = detalleRepository.findByOrdenCompraId(id);

        if (detalles.isEmpty()) {
            throw new RuntimeException("La orden no tiene productos para confirmar");
        }

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleOrdenCompra d : detalles) {
            BigDecimal cantidad = d.getCantidad() != null ? d.getCantidad() : BigDecimal.ZERO;
            BigDecimal precio = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;

            if (cantidad.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero");
            }

            if (precio.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("El precio no puede ser negativo");
            }

            BigDecimal importe = cantidad.multiply(precio);
            d.setImporteTotal(importe);
            detalleRepository.save(d);

            total = total.add(importe);
        }

        orden.setMontoTotal(total.doubleValue());
        orden.setEstado("CONFIRMADA");

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

            stock.setCantidad(stock.getCantidad().add(d.getCantidad()));
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

        return ordenCompraRepository.save(orden);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(orden.getEstado())) {
            throw new RuntimeException("Solo se puede eliminar una orden en estado PENDIENTE");
        }

        detalleRepository.deleteByOrdenCompraId(id);
        ordenCompraRepository.deleteById(id);
    }
}