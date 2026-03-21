package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.dto.MovimientoResumenDTO;
import com.loloyta.model.*;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.service.MovimientoService;

@Service
public class MovimientoServiceImpl implements MovimientoService {

    @Autowired
    private MovimientoRepository repository;

    @Override
    public List<Movimiento> listar() {
        return repository.findAll();
    }

    
    @Override
    public List<MovimientoResumenDTO> listarResumen() {

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

        List<MovimientoResumenDTO> resumen = new ArrayList<>();

        for (Map.Entry<String, List<Movimiento>> entry : agrupados.entrySet()) {

            List<Movimiento> lista = entry.getValue();
            Movimiento primero = lista.get(0);

            resumen.add(new MovimientoResumenDTO(
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

        

        return repository.save(m);
    }

    @Override
    public Movimiento registrarSalida(Long productoId, Long almacenId, BigDecimal cantidad, Long salidaId, Long usuarioId) {

        Movimiento m = new Movimiento();
        m.setTipo("SALIDA");
        m.setCantidad(cantidad);
        m.setFecha(LocalDateTime.now());

        return repository.save(m);
    }
}