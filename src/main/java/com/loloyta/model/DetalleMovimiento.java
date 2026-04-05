package com.loloyta.model;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_movimiento")
public class DetalleMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movimiento_id", nullable = false)
    private Movimiento movimiento;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad = BigDecimal.ZERO;

    @Column(name = "stock_antes_origen", precision = 12, scale = 2)
    private BigDecimal stockAntesOrigen;

    @Column(name = "stock_despues_origen", precision = 12, scale = 2)
    private BigDecimal stockDespuesOrigen;

    @Column(name = "stock_antes_destino", precision = 12, scale = 2)
    private BigDecimal stockAntesDestino;

    @Column(name = "stock_despues_destino", precision = 12, scale = 2)
    private BigDecimal stockDespuesDestino;

    public DetalleMovimiento() {
    }

    public Long getId() {
        return id;
    }

    public Movimiento getMovimiento() {
        return movimiento;
    }

    public void setMovimiento(Movimiento movimiento) {
        this.movimiento = movimiento;
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

    public BigDecimal getStockAntesOrigen() {
        return stockAntesOrigen;
    }

    public void setStockAntesOrigen(BigDecimal stockAntesOrigen) {
        this.stockAntesOrigen = stockAntesOrigen;
    }

    public BigDecimal getStockDespuesOrigen() {
        return stockDespuesOrigen;
    }

    public void setStockDespuesOrigen(BigDecimal stockDespuesOrigen) {
        this.stockDespuesOrigen = stockDespuesOrigen;
    }

    public BigDecimal getStockAntesDestino() {
        return stockAntesDestino;
    }

    public void setStockAntesDestino(BigDecimal stockAntesDestino) {
        this.stockAntesDestino = stockAntesDestino;
    }

    public BigDecimal getStockDespuesDestino() {
        return stockDespuesDestino;
    }

    public void setStockDespuesDestino(BigDecimal stockDespuesDestino) {
        this.stockDespuesDestino = stockDespuesDestino;
    }
}