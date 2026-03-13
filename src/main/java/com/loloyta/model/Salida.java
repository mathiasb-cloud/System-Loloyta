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

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacen;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private Locales local;

    private String estado;

    @ManyToOne
    @JoinColumn(name = "creado_por")
    private Usuario usuario;

    public Salida() {
    }

    public Salida(LocalDateTime fecha, Almacenes almacen, Locales local, String estado, Usuario usuario) {
        this.fecha = fecha;
        this.almacen = almacen;
        this.local = local;
        this.estado = estado;
        this.usuario = usuario;
    }

    public Almacenes getAlmacen() {
        return almacen;
    }

    public void setAlmacen(Almacenes almacen) {
        this.almacen = almacen;
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

    public Locales getLocal() {
        return local;
    }

    public void setLocal(Locales local) {
        this.local = local;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
