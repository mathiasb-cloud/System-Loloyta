package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.StockAsignacionItemDto;
import com.loloyta.dto.StockAuditoriaProductoDto;
import com.loloyta.dto.StockAuditoriaRequestDto;
import com.loloyta.model.Almacenes;
import com.loloyta.model.Producto;
import com.loloyta.model.Proveedor;
import com.loloyta.model.Stock;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.ProductoRepository;
import com.loloyta.repository.ProveedorRepository;
import com.loloyta.repository.StockRepository;
import com.loloyta.service.StockService;

@Service
public class StockServiceImpl implements StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlmacenesRepository almacenesRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Override
    public List<Stock> listar() {
        return stockRepository.findAll();
    }

    @Override
    public List<Stock> listarPorAlmacen(Long almacenId) {
        return stockRepository.findByAlmacenesId(almacenId);
    }

    @Override
    public BigDecimal calcularValorTotalPorAlmacen(Long almacenId) {
        return stockRepository.calcularValorTotalPorAlmacen(almacenId);
    }

    @Override
    public Stock obtenerPorProductoYAlmacen(Long productoId, Long almacenId) {
        return stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElse(null);
    }

    @Override
    public Stock asignarProductoAAlmacen(Long productoId, Long almacenId, Long proveedorId) {
        Stock existente = stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElse(null);

        if (existente != null) {
            throw new RuntimeException("Ese producto ya está asignado a este almacén");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Almacenes almacen = almacenesRepository.findById(almacenId)
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        Proveedor proveedor = null;
        if (proveedorId != null) {
            proveedor = proveedorRepository.findById(proveedorId)
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        }

        Stock stock = new Stock();
        stock.setProducto(producto);
        stock.setAlmacenes(almacen);
        stock.setProveedor(proveedor);
        stock.setCantidad(BigDecimal.ZERO);
        stock.setUltimaActualizacion(LocalDateTime.now());

        return stockRepository.save(stock);
    }

    @Override
    public Stock actualizarProveedor(Long productoId, Long almacenId, Long proveedorId) {
        Stock stock = stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElseThrow(() -> new RuntimeException("Relación stock no encontrada"));

        Proveedor proveedor = null;
        if (proveedorId != null) {
            proveedor = proveedorRepository.findById(proveedorId)
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        }

        stock.setProveedor(proveedor);
        stock.setUltimaActualizacion(LocalDateTime.now());

        return stockRepository.save(stock);
    }

    @Override
    public Stock aumentarStock(Long productoId, Long almacenId, BigDecimal cantidad) {
        Stock stock = stockRepository
                .findByAlmacenesIdAndProductoId(almacenId, productoId)
                .orElseThrow(() -> new RuntimeException("El producto no está asignado a este almacén"));

        if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a cero");
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
                .orElseThrow(() -> new RuntimeException("El producto no está asignado a este almacén"));

        if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a cero");
        }

        if (stock.getCantidad() == null || stock.getCantidad().compareTo(cantidad) < 0) {
            throw new RuntimeException("Stock insuficiente");
        }

        stock.setCantidad(stock.getCantidad().subtract(cantidad));
        stock.setUltimaActualizacion(LocalDateTime.now());

        return stockRepository.save(stock);
    }
    
    @Override
    public List<StockAuditoriaProductoDto> listarAuditoriaPorAlmacen(Long almacenId) {
        List<Producto> productos = productoRepository.findAll()
                .stream()
                .filter(p -> p.getActivo() != null && p.getActivo())
                .toList();

        return productos.stream().map(p -> {
            Stock stock = stockRepository.findByAlmacenesIdAndProductoId(almacenId, p.getId()).orElse(null);

            return new StockAuditoriaProductoDto(
                    p.getId(),
                    p.getNombre(),
                    p.getDescripcion(),
                    p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                    p.getUnidadMedida(),
                    p.getStockMinimo(),
                    p.getPrecioActual(),
                    stock != null,
                    stock != null && stock.getProveedor() != null ? stock.getProveedor().getId() : null,
                    stock != null && stock.getProveedor() != null ? stock.getProveedor().getNombre() : null,
                    stock != null && stock.getCantidad() != null ? stock.getCantidad().toPlainString() : "0"
            );
        }).toList();
    }
    
    @Override
    public void guardarAuditoriaAsignacion(StockAuditoriaRequestDto request) {
        if (request.getAlmacenId() == null) {
            throw new RuntimeException("Debe seleccionar un almacén");
        }

        Almacenes almacen = almacenesRepository.findById(request.getAlmacenId())
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("No hay productos para auditar");
        }

        for (StockAsignacionItemDto item : request.getItems()) {
            if (item.getProductoId() == null) continue;

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductoId()));

            Stock existente = stockRepository.findByAlmacenesIdAndProductoId(almacen.getId(), producto.getId())
                    .orElse(null);

            if (Boolean.TRUE.equals(item.getAsignado())) {
                Proveedor proveedor = null;
                if (item.getProveedorId() != null) {
                    proveedor = proveedorRepository.findById(item.getProveedorId())
                            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
                }

                if (existente == null) {
                    Stock nuevo = new Stock();
                    nuevo.setAlmacenes(almacen);
                    nuevo.setProducto(producto);
                    nuevo.setProveedor(proveedor);
                    nuevo.setCantidad(BigDecimal.ZERO);
                    nuevo.setUltimaActualizacion(LocalDateTime.now());
                    stockRepository.save(nuevo);
                } else {
                    existente.setProveedor(proveedor);
                    existente.setUltimaActualizacion(LocalDateTime.now());
                    stockRepository.save(existente);
                }
            } else {
                if (existente != null) {
                    BigDecimal cantidad = existente.getCantidad() != null ? existente.getCantidad() : BigDecimal.ZERO;

                    if (cantidad.compareTo(BigDecimal.ZERO) > 0) {
                        throw new IllegalStateException(
                            "No se puede desasignar el producto \"" + producto.getNombre() +
                            "\" del almacén porque cuenta con stock disponible."
                        );
                    }

                    stockRepository.delete(existente);
                }
            }
        }
    }

    @Override
    public List<Stock> listarStockBajo() {
        List<Stock> todos = stockRepository.findAll();
        return todos.stream()
            .filter(s -> s.getProducto() != null 
                && Boolean.TRUE.equals(s.getProducto().getActivo())
                && s.getCantidad() != null 
                && s.getProducto().getStockMinimo() != null
                && s.getCantidad().doubleValue() <= s.getProducto().getStockMinimo())
            .toList();
    }

    @Override
    public List<Stock> listarStockBajoPorAlmacen(Long almacenId) {
        List<Stock> todos = stockRepository.findByAlmacenesId(almacenId);
        return todos.stream()
            .filter(s -> s.getProducto() != null 
                && Boolean.TRUE.equals(s.getProducto().getActivo())
                && s.getCantidad() != null 
                && s.getProducto().getStockMinimo() != null
                && s.getCantidad().doubleValue() <= s.getProducto().getStockMinimo())
            .toList();
    }
}