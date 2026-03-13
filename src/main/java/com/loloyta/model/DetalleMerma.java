package com.loloyta.model;

import jakarta.persistence.*;

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

    private Double cantidad;

    public DetalleMerma() {
    }

    public DetalleMerma(Merma merma, Producto producto, Double cantidad) {
        this.merma = merma;
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getCantidad() {
        return cantidad;
    }

    public void setCantidad(Double cantidad) {
        this.cantidad = cantidad;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Merma getMerma() {
        return merma;
    }

    public void setMerma(Merma merma) {
        this.merma = merma;
    }
}
