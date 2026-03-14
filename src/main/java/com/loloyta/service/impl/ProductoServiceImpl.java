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
        return productoRepository.save(producto);
    }

    @Override
    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElse(null);
    }


    @Override
    public Producto actualizar(Long id, Producto producto) {
        Producto p = productoRepository.findById(id).orElse(null);

        if(p != null){
            p.setNombre(producto.getNombre());
            p.setDescripcion(producto.getDescripcion());
            p.setCategoria(producto.getCategoria());
            p.setUnidadMedida(producto.getUnidadMedida());
            p.setStockMinimo(producto.getStockMinimo());
            p.setActivo(producto.getActivo());

            return productoRepository.save(p);
        }

        return null;
    }

    @Override
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}
