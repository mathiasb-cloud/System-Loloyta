package com.loloyta.service.impl;

import com.loloyta.model.Producto;
import com.loloyta.repository.ProductoRepository;
import com.loloyta.service.ProductoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    @Override
    public Producto guardar(Producto producto) {
        String nombre = producto.getNombre().trim();

        if (productoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RuntimeException("Ya existe un producto con ese nombre.");
        }

        producto.setNombre(nombre);

        if (producto.getDescripcion() != null) {
            producto.setDescripcion(producto.getDescripcion().trim());
        }

        if (producto.getUnidadMedida() != null) {
            producto.setUnidadMedida(producto.getUnidadMedida().trim());
        }

        return productoRepository.save(producto);
    }

    @Override
    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElse(null);
    }


    @Override
    public Producto actualizar(Long id, Producto producto) {
        Producto p = productoRepository.findById(id).orElse(null);

        if (p != null) {
            String nombre = producto.getNombre().trim();

            if (productoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
                throw new RuntimeException("Ya existe un producto con ese nombre.");
            }

            p.setNombre(nombre);
            p.setDescripcion(producto.getDescripcion() != null ? producto.getDescripcion().trim() : null);
            p.setCategoria(producto.getCategoria());
            p.setUnidadMedida(producto.getUnidadMedida() != null ? producto.getUnidadMedida().trim() : null);
            p.setPrecioActual(producto.getPrecioActual());
            p.setStockMinimo(producto.getStockMinimo());
            p.setActivo(producto.getActivo());

            return productoRepository.save(p);
        }

        return null;
    }

    @Override
    public void eliminar(Long id) {
        Producto p = productoRepository.findById(id).orElse(null);

        if (p != null) {
            p.setActivo(false);
            productoRepository.save(p);
        }
    }
    
    @Override
    public Producto toggleActivo(Long id) {
        Producto p = productoRepository.findById(id).orElse(null);

        if (p != null) {
            p.setActivo(!Boolean.TRUE.equals(p.getActivo()));
            return productoRepository.save(p);
        }

        return null;
    }
}
