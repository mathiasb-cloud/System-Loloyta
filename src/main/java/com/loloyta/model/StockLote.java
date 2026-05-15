package com.loloyta.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "stock_lote")
public class StockLote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long loteId;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacen;

    private Double cantidadInicial;
    private Double cantidadDisponible;
    private Double costoUnitario;

    private LocalDateTime fechaIngreso;
    private LocalDateTime fechaVencimiento;

    private Boolean activo;

	public Long getLoteId() {
		return loteId;
	}

	public void setLoteId(Long loteId) {
		this.loteId = loteId;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public Almacenes getAlmacen() {
		return almacen;
	}

	public void setAlmacen(Almacenes almacen) {
		this.almacen = almacen;
	}

	public Double getCantidadInicial() {
		return cantidadInicial;
	}

	public void setCantidadInicial(Double cantidadInicial) {
		this.cantidadInicial = cantidadInicial;
	}

	public Double getCantidadDisponible() {
		return cantidadDisponible;
	}

	public void setCantidadDisponible(Double cantidadDisponible) {
		this.cantidadDisponible = cantidadDisponible;
	}

	public Double getCostoUnitario() {
		return costoUnitario;
	}

	public void setCostoUnitario(Double costoUnitario) {
		this.costoUnitario = costoUnitario;
	}

	public LocalDateTime getFechaIngreso() {
		return fechaIngreso;
	}

	public void setFechaIngreso(LocalDateTime fechaIngreso) {
		this.fechaIngreso = fechaIngreso;
	}

	public LocalDateTime getFechaVencimiento() {
		return fechaVencimiento;
	}

	public void setFechaVencimiento(LocalDateTime fechaVencimiento) {
		this.fechaVencimiento = fechaVencimiento;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}
    
    



}