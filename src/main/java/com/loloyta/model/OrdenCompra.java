package com.loloyta.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "monto_total")
    private Double montoTotal;

    private String estado;

    @ManyToOne
    @JoinColumn(name = "creado_por")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacenes;

    public OrdenCompra() {
    }

    public OrdenCompra(LocalDateTime fecha, String metodoPago, Double montoTotal, String estado, Usuario usuario, Almacenes almacenes) {
        this.fecha = fecha;
        this.metodoPago = metodoPago;
        this.montoTotal = montoTotal;
        this.estado = estado;
        this.usuario = usuario;
        this.almacenes = almacenes;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Almacenes getAlmacenes() {
        return almacenes;
    }

    public void setAlmacenes(Almacenes almacenes) {
        this.almacenes = almacenes;
    }
}