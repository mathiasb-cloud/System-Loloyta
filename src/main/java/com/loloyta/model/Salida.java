package com.loloyta.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "salidas")
public class Salida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;

    private String estado;

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacenes;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private Locales locales;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Salida() {}

	public Salida(LocalDateTime fecha, String estado, Almacenes almacenes, Locales locales, Usuario usuario) {
		this.fecha = fecha;
		this.estado = estado;
		this.almacenes = almacenes;
		this.locales = locales;
		this.usuario = usuario;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public Almacenes getAlmacenes() {
		return almacenes;
	}

	public void setAlmacenes(Almacenes almacenes) {
		this.almacenes = almacenes;
	}

	public Locales getLocales() {
		return locales;
	}

	public void setLocales(Locales locales) {
		this.locales = locales;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}
    
    
}

   