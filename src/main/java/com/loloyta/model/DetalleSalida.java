package com.loloyta.model;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "detalle_salida")
public class DetalleSalida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "salida_id")
    private Salida salida;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

  
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lote_id")
    private StockLote lote;

    private BigDecimal cantidadDespacho;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Salida getSalida() {
		return salida;
	}

	public void setSalida(Salida salida) {
		this.salida = salida;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public StockLote getLote() {
		return lote;
	}

	public void setLote(StockLote lote) {
		this.lote = lote;
	}

	public BigDecimal getCantidadDespacho() {
		return cantidadDespacho;
	}

	public void setCantidadDespacho(BigDecimal cantidadDespacho) {
		this.cantidadDespacho = cantidadDespacho;
	}

    
}