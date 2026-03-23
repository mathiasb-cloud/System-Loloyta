package com.loloyta.service;

import java.util.List;
import com.loloyta.model.DetalleOrdenCompra;

public interface DetalleOrdenCompraService {

    List<DetalleOrdenCompra> listar();

    List<DetalleOrdenCompra> listarPorOrden(Long ordenId);

    DetalleOrdenCompra crear(DetalleOrdenCompra detalle);

    DetalleOrdenCompra actualizar(Long id, DetalleOrdenCompra detalle);

    void eliminar(Long id);

    void eliminarPorOrdenId(Long ordenId);
}