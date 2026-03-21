package com.loloyta.repository;

import com.loloyta.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto,Long> {
	
	boolean existsByNombreIgnoreCase(String nombre);
	boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
