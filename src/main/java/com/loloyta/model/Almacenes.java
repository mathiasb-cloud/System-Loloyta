package com.loloyta.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "almacenes")
public class Almacenes {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String ubicacion;

    private Boolean activo;

	public Almacenes() {
		
	}

	public Almacenes(String nombre, String ubicacion, Boolean activo) {
		this.nombre = nombre;
		this.ubicacion = ubicacion;
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

	public String getUbicacion() {
		return ubicacion;
	}

	public void setUbicacion(String ubicacion) {
		this.ubicacion = ubicacion;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}
	
	
	
    
    
    
}

