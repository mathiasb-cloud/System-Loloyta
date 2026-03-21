package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleSalida;
import com.loloyta.model.Movimiento;
import com.loloyta.model.Salida;
import com.loloyta.repository.DetalleSalidaRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.SalidaRepository;
import com.loloyta.service.SalidaService;
import com.loloyta.service.StockService;

@Service
public class SalidaServiceImpl implements SalidaService {

    @Autowired
    private SalidaRepository salidaRepository;

    @Autowired
    private DetalleSalidaRepository detalleRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private MovimientoRepository movimientoRepository;

    @Override
    public List<Salida> listar() {
        return salidaRepository.findAll();
    }

    @Override
    public Optional<Salida> obtenerPorId(Long id) {
        return salidaRepository.findById(id);
    }

    @Override
    public Salida crear(Salida salida) {
        salida.setEstado("PENDIENTE");
        salida.setFecha(LocalDateTime.now());
        return salidaRepository.save(salida);
    }

    @Override
    public Salida actualizar(Long id, Salida salidaActualizada) {

        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        salida.setAlmacenes(salidaActualizada.getAlmacenes());
        salida.setUsuario(salidaActualizada.getUsuario());

        return salidaRepository.save(salida);
    }

    @Override
    public void eliminar(Long id) {
        salidaRepository.deleteById(id);
    }

    @Override
    public Salida confirmar(Long id) {

        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        if ("CONFIRMADA".equals(salida.getEstado())) {
            return salida;
        }

        salida.setEstado("CONFIRMADA");

        List<DetalleSalida> detalles = detalleRepository.findBySalidaId(id);

        for (DetalleSalida d : detalles) {

            BigDecimal cantidadDespacho = d.getCantidadDespacho();

            
            stockService.disminuirStock(
            	    d.getProducto().getId(),
            	    salida.getAlmacenes().getId(),
            	    d.getCantidadDespacho()
            	);

            
            Movimiento mov = new Movimiento();

            mov.setTipo("SALIDA");
            mov.setCantidad(cantidadDespacho);
            mov.setFecha(LocalDateTime.now());
            mov.setAlmacen(salida.getAlmacenes());
            mov.setUsuario(salida.getUsuario());
            mov.setSalida(salida);
            mov.setProducto(d.getProducto());

            movimientoRepository.save(mov);
        }

        return salidaRepository.save(salida);
    }
}