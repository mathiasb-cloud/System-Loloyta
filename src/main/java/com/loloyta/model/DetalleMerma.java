package com.loloyta.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_merma")
public class DetalleMerma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "merma_id")
    private Merma merma;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private BigDecimal cantidad;

    public DetalleMerma() {
    }

    public DetalleMerma(Merma merma, Producto producto, BigDecimal cantidad) {
        this.merma = merma;
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public Long getId() {
        return id;
    }

    public Merma getMerma() {
        return merma;
    }

    public void setMerma(Merma merma) {
        this.merma = merma;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }
}