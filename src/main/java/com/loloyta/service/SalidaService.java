package com.loloyta.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleSalida;
import com.loloyta.model.Movimiento;
import com.loloyta.model.Salida;
import com.loloyta.repository.DetalleSalidaRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.SalidaRepository;

@Service
public class SalidaService {

    @Autowired
    private SalidaRepository salidaRepository;

    @Autowired
    private DetalleSalidaRepository detalleRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private MovimientoRepository movimientoRepository;

    public Salida crear(Salida salida) {
        salida.setEstado("PENDIENTE");
        salida.setFecha(LocalDateTime.now());
        return salidaRepository.save(salida);
    }

    public Salida confirmar(Long id) {

        Salida salida = salidaRepository.findById(id)
                .orElseThrow();

        if (salida.getEstado().equals("CONFIRMADA")) {
            return salida;
        }

        salida.setEstado("CONFIRMADA");

        List<DetalleSalida> detalles = detalleRepository.findBySalidaId(id);

        for (DetalleSalida d : detalles) {

            
            stockService.disminuirStock(
                    d.getProducto().getId(),
                    salida.getAlmacenes().getId(),
                    d.getCantidad()
            );

            
            Movimiento mov = new Movimiento();

            mov.setTipo("SALIDA");
            mov.setCantidad(d.getCantidad());
            mov.setFecha(LocalDateTime.now());
            mov.setAlmacen(salida.getAlmacenes());
            mov.setUsuario(salida.getUsuario());
            mov.setSalida(salida);

            movimientoRepository.save(mov);
        }

        return salidaRepository.save(salida);
    }
}