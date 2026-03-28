package com.loloyta.service;

import com.loloyta.model.Proveedor;
import java.util.List;
import java.util.Optional;

public interface ProveedorService {
    List<Proveedor> listar();
    Optional<Proveedor> obtenerPorId(Long id);
    Proveedor guardar(Proveedor proveedor);
    Proveedor actualizar(Long id, Proveedor proveedor);
    void eliminar(Long id);
}