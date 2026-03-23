package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.MovimientoResumenDto;
import com.loloyta.model.*;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.OrdenCompraRepository;
import com.loloyta.repository.ProductoRepository;
import com.loloyta.repository.SalidaRepository;
import com.loloyta.repository.UsuarioRepository;
import com.loloyta.service.MovimientoService;
import com.loloyta.dto.MovimientoDetalleDto;
import com.loloyta.dto.MovimientoDetalleItemDto;
import com.loloyta.repository.DetalleOrdenCompraRepository;
import com.loloyta.repository.DetalleSalidaRepository;

@Service
public class MovimientoServiceImpl implements MovimientoService {

    @Autowired
    private MovimientoRepository repository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlmacenesRepository almacenesRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private SalidaRepository salidaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Autowired
    private DetalleSalidaRepository detalleSalidaRepository;

    @Override
    public List<Movimiento> listar() {
        return repository.findAll();
    }

    @Override
    public List<MovimientoResumenDto> listarResumen() {

        List<Movimiento> movimientos = repository.findAll();

        Map<String, List<Movimiento>> agrupados = movimientos.stream()
                .collect(Collectors.groupingBy(m -> {
                    if (m.getOrdenCompra() != null) {
                        return "OC-" + m.getOrdenCompra().getId();
                    } else if (m.getSalida() != null) {
                        return "SAL-" + m.getSalida().getId();
                    } else {
                        return "OTRO-" + m.getId();
                    }
                }));

        List<MovimientoResumenDto> resumen = new ArrayList<>();

        for (Map.Entry<String, List<Movimiento>> entry : agrupados.entrySet()) {

            List<Movimiento> lista = entry.getValue();
            Movimiento primero = lista.get(0);

            resumen.add(new MovimientoResumenDto(
                    primero.getTipo(),
                    primero.getFecha(),
                    entry.getKey(),
                    lista.size()
            ));
        }

        return resumen;
    }

    @Override
    public Movimiento registrarIngreso(Long productoId, Long almacenId, BigDecimal cantidad, Long ordenId, Long usuarioId) {

        Movimiento m = new Movimiento();

        m.setTipo("INGRESO");
        m.setCantidad(cantidad);
        m.setFecha(LocalDateTime.now());

        m.setProducto(productoRepository.findById(productoId).orElse(null));
        m.setAlmacen(almacenesRepository.findById(almacenId).orElse(null));
        m.setOrdenCompra(ordenCompraRepository.findById(ordenId).orElse(null));
        m.setUsuario(usuarioRepository.findById(usuarioId).orElse(null));

        return repository.save(m);
    }

    @Override
    public Movimiento registrarSalida(Long productoId, Long almacenId, BigDecimal cantidad, Long salidaId, Long usuarioId) {

        Movimiento m = new Movimiento();

        m.setTipo("SALIDA");
        m.setCantidad(cantidad);
        m.setFecha(LocalDateTime.now());

        m.setProducto(productoRepository.findById(productoId).orElse(null));
        m.setAlmacen(almacenesRepository.findById(almacenId).orElse(null));
        m.setSalida(salidaRepository.findById(salidaId).orElse(null));
        m.setUsuario(usuarioRepository.findById(usuarioId).orElse(null));

        return repository.save(m);
    }
    
    @Override
    public MovimientoDetalleDto obtenerDetallePorReferencia(String referencia) {

        List<Movimiento> movimientos = repository.findAll();

        List<Movimiento> grupo = movimientos.stream()
                .filter(m -> {
                    if (m.getOrdenCompra() != null) {
                        return referencia.equals("OC-" + m.getOrdenCompra().getId());
                    } else if (m.getSalida() != null) {
                        return referencia.equals("SAL-" + m.getSalida().getId());
                    } else {
                        return referencia.equals("OTRO-" + m.getId());
                    }
                })
                .collect(Collectors.toList());

        if (grupo.isEmpty()) {
            throw new RuntimeException("No se encontró el movimiento con referencia: " + referencia);
        }

        Movimiento primero = grupo.get(0);

        MovimientoDetalleDto dto = new MovimientoDetalleDto();
        dto.setReferencia(referencia);
        dto.setTipo(primero.getTipo());
        dto.setFecha(primero.getFecha());
        dto.setAlmacenNombre(primero.getAlmacen() != null ? primero.getAlmacen().getNombre() : null);
        dto.setUsuarioNombre(primero.getUsuario() != null ? primero.getUsuario().getNombre() : null);
        dto.setTotalItems(grupo.size());

        List<MovimientoDetalleItemDto> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        if (primero.getOrdenCompra() != null) {
            OrdenCompra oc = primero.getOrdenCompra();

            dto.setOrdenCompraId(oc.getId());
            dto.setOrdenCompraFecha(oc.getFecha());
            dto.setOrdenCompraMetodoPago(oc.getMetodoPago());
            dto.setOrdenCompraMontoTotal(oc.getMontoTotal());
            dto.setOrdenCompraEstado(oc.getEstado());

            List<DetalleOrdenCompra> detalles = detalleOrdenCompraRepository.findByOrdenCompraId(oc.getId());

            for (DetalleOrdenCompra d : detalles) {
                Producto p = d.getProducto();

                BigDecimal cantidad = d.getCantidad() != null ? d.getCantidad() : BigDecimal.ZERO;
                BigDecimal precio = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal importe = cantidad.multiply(precio);

                MovimientoDetalleItemDto item = new MovimientoDetalleItemDto();
                item.setProductoId(p.getId());
                item.setProductoNombre(p.getNombre());
                item.setDescripcion(p.getDescripcion());
                item.setCategoria(p.getCategoria() != null ? p.getCategoria().getNombre() : null);
                item.setUnidadMedida(p.getUnidadMedida());
                item.setStockMinimo(p.getStockMinimo());
                item.setActivo(p.getActivo());
                item.setPrecioActual(precio.doubleValue());
                item.setCantidad(cantidad);
                item.setImporte(importe);

                items.add(item);
                total = total.add(importe);
            }
        }

        else if (primero.getSalida() != null) {
            Salida salida = primero.getSalida();

            dto.setSalidaId(salida.getId());
            dto.setSalidaFecha(salida.getFecha());
            dto.setSalidaEstado(salida.getEstado());
            dto.setLocalDestinoNombre(
                    salida.getLocales() != null ? salida.getLocales().getNombre() : null
            );

            List<DetalleSalida> detalles = detalleSalidaRepository.findBySalidaId(salida.getId());

            for (DetalleSalida d : detalles) {
                Producto p = d.getProducto();

                BigDecimal cantidad = d.getCantidadDespacho() != null ? d.getCantidadDespacho() : BigDecimal.ZERO;
                BigDecimal precio = p.getPrecioActual() != null
                        ? BigDecimal.valueOf(p.getPrecioActual())
                        : BigDecimal.ZERO;
                BigDecimal importe = cantidad.multiply(precio);

                MovimientoDetalleItemDto item = new MovimientoDetalleItemDto();
                item.setProductoId(p.getId());
                item.setProductoNombre(p.getNombre());
                item.setDescripcion(p.getDescripcion());
                item.setCategoria(p.getCategoria() != null ? p.getCategoria().getNombre() : null);
                item.setUnidadMedida(p.getUnidadMedida());
                item.setStockMinimo(p.getStockMinimo());
                item.setActivo(p.getActivo());
                item.setPrecioActual(p.getPrecioActual());
                item.setCantidad(cantidad);
                item.setImporte(importe);

                items.add(item);
                total = total.add(importe);
            }
        }

        dto.setProductos(items);
        dto.setImporteTotalCalculado(total);

        return dto;
    }
}