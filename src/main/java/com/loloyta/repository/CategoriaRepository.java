package com.loloyta.repository;

import com.loloyta.model.Categorias;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categorias,Long> {
}
