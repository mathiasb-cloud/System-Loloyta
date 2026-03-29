package com.loloyta.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "stock",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"almacen_id", "producto_id"})
    }
)
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "almacen_id", nullable = false)
    private Almacenes almacenes;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor; // opcional

    private BigDecimal cantidad;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    public Stock() {
    }

    public Stock(Almacenes almacenes, Producto producto, Proveedor proveedor,
                 BigDecimal cantidad, LocalDateTime ultimaActualizacion) {
        this.almacenes = almacenes;
        this.producto = producto;
        this.proveedor = proveedor;
        this.cantidad = cantidad;
        this.ultimaActualizacion = ultimaActualizacion;
    }

    public Long getId() {
        return id;
    }

    public Almacenes getAlmacenes() {
        return almacenes;
    }

    public void setAlmacenes(Almacenes almacenes) {
        this.almacenes = almacenes;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public LocalDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }

    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
    }
}