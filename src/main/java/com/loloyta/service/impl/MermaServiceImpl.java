package com.loloyta.service.impl;

import com.loloyta.model.*;
import com.loloyta.repository.DetalleMermaRepository;
import com.loloyta.repository.MermaRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.StockRepository;
import com.loloyta.service.AuthService;
import com.loloyta.service.MermaService;
import com.loloyta.service.StockLoteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MermaServiceImpl implements MermaService {

    private final MermaRepository mermaRepository;
    private final DetalleMermaRepository detalleMermaRepository;
    private final StockRepository stockRepository;
    private final MovimientoRepository movimientoRepository;

    public MermaServiceImpl(MermaRepository mermaRepository,
                            DetalleMermaRepository detalleMermaRepository,
                            StockRepository stockRepository,
                            MovimientoRepository movimientoRepository) {
        this.mermaRepository = mermaRepository;
        this.detalleMermaRepository = detalleMermaRepository;
        this.stockRepository = stockRepository;
        this.movimientoRepository = movimientoRepository;
    }
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private StockLoteService stockLoteService;

    @Override
    public List<Merma> listar() {
        return mermaRepository.findAll();
    }

    @Override
    public Optional<Merma> obtenerPorId(Long id) {
        return mermaRepository.findById(id);
    }

    @Override
    public Merma crear(Merma merma) {
        if (merma.getAlmacen() == null || merma.getAlmacen().getId() == null) {
            throw new RuntimeException("Debe seleccionar un almacén");
        }

        if (merma.getMotivo() == null || merma.getMotivo().getId() == null) {
            throw new RuntimeException("Debe seleccionar un motivo de merma");
        }
        
        merma.setUsuario(authService.obtenerUsuarioAutenticado());
        merma.setEstado("PENDIENTE");

        if (merma.getFecha() == null) {
            merma.setFecha(LocalDateTime.now());
        }

        return mermaRepository.save(merma);
    }

    @Override
    public Merma actualizar(Long id, Merma mermaActualizada) {
        Merma merma = mermaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Merma no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(merma.getEstado())) {
            throw new RuntimeException("Solo se puede editar una merma en estado PENDIENTE");
        }

        if (mermaActualizada.getAlmacen() == null || mermaActualizada.getAlmacen().getId() == null) {
            throw new RuntimeException("Debe seleccionar un almacén");
        }

        if (mermaActualizada.getMotivo() == null || mermaActualizada.getMotivo().getId() == null) {
            throw new RuntimeException("Debe seleccionar un motivo de merma");
        }
        
        merma.setUsuario(authService.obtenerUsuarioAutenticado());

        merma.setAlmacen(mermaActualizada.getAlmacen());
        merma.setMotivo(mermaActualizada.getMotivo());
        merma.setObservacion(mermaActualizada.getObservacion());
        merma.setUsuario(mermaActualizada.getUsuario());

        return mermaRepository.save(merma);
    }

    @Override
    @Transactional
    public Merma confirmar(Long id) {
        Merma merma = mermaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Merma no encontrada"));

        if ("CONFIRMADA".equalsIgnoreCase(merma.getEstado())) {
            return merma;
        }

        List<DetalleMerma> detalles = detalleMermaRepository.findByMermaId(id);

        if (detalles.isEmpty()) {
            throw new RuntimeException("La merma no tiene productos");
        }

        for (DetalleMerma d : detalles) {
            if (d.getProducto() == null || d.getProducto().getId() == null) {
                throw new RuntimeException("Existe un detalle sin producto");
            }

            if (d.getCantidad() == null || d.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("La cantidad de merma debe ser mayor a cero");
            }

            Stock stock = stockRepository
                    .findByAlmacenesIdAndProductoId(
                            merma.getAlmacen().getId(),
                            d.getProducto().getId()
                    )
                    .orElseThrow(() -> new RuntimeException(
                            "No existe stock para el producto: " + d.getProducto().getNombre()
                    ));

            if (stock.getCantidad() == null || stock.getCantidad().compareTo(d.getCantidad()) < 0) {
                throw new RuntimeException(
                        "Stock insuficiente para el producto: " + d.getProducto().getNombre()
                );
            }

            stock.setCantidad(stock.getCantidad().subtract(d.getCantidad()));
            stock.setUltimaActualizacion(LocalDateTime.now());
            stockRepository.save(stock);
            
            stockLoteService.descontarFIFO(
            	    d.getProducto().getId(),
            	    merma.getAlmacen().getId(),
            	    d.getCantidad().doubleValue(),
            	    "MERMA",
            	    merma.getId()
            	);

            Movimiento mov = new Movimiento();
            mov.setUsuario(authService.obtenerUsuarioAutenticado());
            mov.setTipo("MERMA");
            mov.setMerma(merma);
            mov.setCantidad(d.getCantidad());
            mov.setFecha(LocalDateTime.now());
            mov.setAlmacen(merma.getAlmacen());
            mov.setProducto(d.getProducto());

            movimientoRepository.save(mov);
        }

        merma.setEstado("CONFIRMADA");
        return mermaRepository.save(merma);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenDashboard() {
        List<Merma> mermas = mermaRepository.findAll();

        int totalMermasConfirmadas = 0;
        BigDecimal costoTotalMerma = BigDecimal.ZERO;

        for (Merma merma : mermas) {
            if (!"CONFIRMADA".equalsIgnoreCase(merma.getEstado())) {
                continue;
            }

            totalMermasConfirmadas++;

            List<DetalleMerma> detalles = detalleMermaRepository.findByMermaId(merma.getId());

            for (DetalleMerma detalle : detalles) {
                BigDecimal cantidad = detalle.getCantidad() != null
                        ? detalle.getCantidad()
                        : BigDecimal.ZERO;

                Double precioProducto = detalle.getProducto() != null
                        ? detalle.getProducto().getPrecioActual()
                        : 0.0;

                BigDecimal precio = BigDecimal.valueOf(precioProducto != null ? precioProducto : 0.0);

                costoTotalMerma = costoTotalMerma.add(cantidad.multiply(precio));
            }
        }

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalMermasConfirmadas", totalMermasConfirmadas);
        resumen.put("costoTotalMerma", costoTotalMerma);

        return resumen;
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Merma merma = mermaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Merma no encontrada"));

        if (!"PENDIENTE".equalsIgnoreCase(merma.getEstado())) {
            throw new RuntimeException("Solo se puede eliminar una merma en estado PENDIENTE");
        }

        detalleMermaRepository.deleteByMermaId(id);
        mermaRepository.deleteById(id);
    }
}