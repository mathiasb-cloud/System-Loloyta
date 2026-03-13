package com.loloyta.repository;

import com.loloyta.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Usuario findByUsuario(String usuario);

}
