package com.loloyta.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // INGRESO, SALIDA, MERMA

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacen;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private BigDecimal cantidad;

    @ManyToOne
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;
    
    @ManyToOne
    @JoinColumn(name = "merma_id")
    private Merma merma;

    @ManyToOne
    @JoinColumn(name = "salida_id")
    private Salida salida;
    
    @ManyToOne
    @JoinColumn(name = "almacen_destino_id")
    private Almacenes almacenDestino;

    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Movimiento() {}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public Almacenes getAlmacen() {
		return almacen;
	}

	public void setAlmacen(Almacenes almacen) {
		this.almacen = almacen;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public BigDecimal getCantidad() {
		return cantidad;
	}

	public void setCantidad(BigDecimal cantidad) {
		this.cantidad = cantidad;
	}

	public OrdenCompra getOrdenCompra() {
		return ordenCompra;
	}

	public void setOrdenCompra(OrdenCompra ordenCompra) {
		this.ordenCompra = ordenCompra;
	}

	public Salida getSalida() {
		return salida;
	}

	public void setSalida(Salida salida) {
		this.salida = salida;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Merma getMerma() {
		return merma;
	}

	public void setMerma(Merma merma) {
		this.merma = merma;
	}
	
	public Almacenes getAlmacenDestino() {
	    return almacenDestino;
	}

	public void setAlmacenDestino(Almacenes almacenDestino) {
	    this.almacenDestino = almacenDestino;
	}
	
	
	
	
    
    
    
    
    
}