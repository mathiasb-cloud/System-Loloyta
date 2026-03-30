package com.loloyta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.loloyta.model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    List<Rol> findByNombreNot(String nombre);

    List<Rol> findByNombreNotAndActivoTrue(String nombre);
}