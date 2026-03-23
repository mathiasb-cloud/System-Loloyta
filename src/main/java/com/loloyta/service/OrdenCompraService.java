package com.loloyta.service;

import java.util.List;
import java.util.Optional;

import com.loloyta.model.OrdenCompra;

public interface OrdenCompraService {

    List<OrdenCompra> listar();

    Optional<OrdenCompra> obtenerPorId(Long id);

    OrdenCompra crear(OrdenCompra orden);

    OrdenCompra actualizar(Long id, OrdenCompra orden);

    OrdenCompra cambiarEstado(Long id, String estado);

    void eliminar(Long id);
}