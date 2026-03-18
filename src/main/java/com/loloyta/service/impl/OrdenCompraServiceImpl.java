package com.loloyta.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.OrdenCompra;
import com.loloyta.repository.OrdenCompraRepository;
import com.loloyta.service.OrdenCompraService;

@Service
public class OrdenCompraServiceImpl implements OrdenCompraService {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

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
        orden.setEstado("PENDIENTE"); // clave
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

        return ordenCompraRepository.save(orden);
    }
}