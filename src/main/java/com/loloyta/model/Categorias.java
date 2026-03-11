package com.loloyta.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categorias")
public class Categorias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion ;
    private boolean activo;


    public Categorias() {
    }

    public Categorias(String descripcion, String nombre, boolean activo) {
        this.descripcion = descripcion;
        this.nombre = nombre;
        this.activo = activo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
