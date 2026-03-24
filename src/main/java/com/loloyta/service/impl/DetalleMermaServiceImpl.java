package com.loloyta.service.impl;

import com.loloyta.model.DetalleMerma;
import com.loloyta.repository.DetalleMermaRepository;
import com.loloyta.service.DetalleMermaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DetalleMermaServiceImpl implements DetalleMermaService {

    private final DetalleMermaRepository repository;

    public DetalleMermaServiceImpl(DetalleMermaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<DetalleMerma> listar() {
        return repository.findAll();
    }

    @Override
    public List<DetalleMerma> listarPorMerma(Long mermaId) {
        return repository.findByMermaId(mermaId);
    }

    @Override
    public DetalleMerma crear(DetalleMerma detalle) {
        validarCantidad(detalle.getCantidad());
        return repository.save(detalle);
    }

    @Override
    public DetalleMerma actualizar(Long id, DetalleMerma detalleActualizado) {
        DetalleMerma detalle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de merma no encontrado"));

        validarCantidad(detalleActualizado.getCantidad());

        detalle.setProducto(detalleActualizado.getProducto());
        detalle.setCantidad(detalleActualizado.getCantidad());

        return repository.save(detalle);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void eliminarPorMermaId(Long mermaId) {
        repository.deleteByMermaId(mermaId);
    }

    private void validarCantidad(BigDecimal cantidad) {
        if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La cantidad de merma debe ser mayor a cero");
        }
    }
}