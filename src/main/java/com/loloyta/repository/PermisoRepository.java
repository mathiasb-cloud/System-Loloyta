package com.loloyta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.loloyta.model.Permiso;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByCodigo(String codigo);

    List<Permiso> findByActivoTrueOrderByModuloAscAccionAsc();

    List<Permiso> findAllByOrderByModuloAscAccionAsc();
}