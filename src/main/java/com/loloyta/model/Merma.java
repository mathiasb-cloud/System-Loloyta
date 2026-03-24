package com.loloyta.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mermas")
public class Merma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacen;

    @ManyToOne
    @JoinColumn(name = "motivo_merma_id")
    private MotivoMerma motivo;

    private String observacion;

    private LocalDateTime fecha;

    private String estado; // PENDIENTE, CONFIRMADA, CANCELADA

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Merma() {
    }

    public Merma(Almacenes almacen, MotivoMerma motivo, String observacion,
                 LocalDateTime fecha, String estado, Usuario usuario) {
        this.almacen = almacen;
        this.motivo = motivo;
        this.observacion = observacion;
        this.fecha = fecha;
        this.estado = estado;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public Almacenes getAlmacen() {
        return almacen;
    }

    public void setAlmacen(Almacenes almacen) {
        this.almacen = almacen;
    }

    public MotivoMerma getMotivo() {
        return motivo;
    }

    public void setMotivo(MotivoMerma motivo) {
        this.motivo = motivo;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}