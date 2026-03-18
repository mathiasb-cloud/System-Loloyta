package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleOrdenCompra;
import com.loloyta.repository.DetalleOrdenCompraRepository;
import com.loloyta.service.DetalleOrdenCompraService;

@Service
public class DetalleOrdenCompraServiceImpl implements DetalleOrdenCompraService {

    @Autowired
    private DetalleOrdenCompraRepository repository;

    @Override
    public List<DetalleOrdenCompra> listar() {
        return repository.findAll();
    }

    @Override
    public List<DetalleOrdenCompra> listarPorOrden(Long ordenId) {
        return repository.findByOrdenCompraId(ordenId);
    }

    @Override
    public DetalleOrdenCompra crear(DetalleOrdenCompra detalle) {

        
        BigDecimal importe = detalle.getPrecioUnitario()
                .multiply(detalle.getCantidad());

        detalle.setImporteTotal(importe);

        return repository.save(detalle);
    }

    @Override
    public DetalleOrdenCompra actualizar(Long id, DetalleOrdenCompra detalleActualizado) {

        DetalleOrdenCompra detalle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado"));

        detalle.setProducto(detalleActualizado.getProducto());
        detalle.setCantidad(detalleActualizado.getCantidad());
        detalle.setPrecioUnitario(detalleActualizado.getPrecioUnitario());

        
        BigDecimal importe = detalle.getPrecioUnitario()
                .multiply(detalle.getCantidad());

        detalle.setImporteTotal(importe);

        return repository.save(detalle);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}