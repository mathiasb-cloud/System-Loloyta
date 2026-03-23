package com.loloyta.dto;

import java.time.LocalDateTime;

public class MovimientoResumenDto {

    private String tipo;
    private LocalDateTime fecha;
    private String referencia;
    private Integer totalItems;

    public MovimientoResumenDto() {
    }

    public MovimientoResumenDto(String tipo, LocalDateTime fecha, String referencia, Integer totalItems) {
        this.tipo = tipo;
        this.fecha = fecha;
        this.referencia = referencia;
        this.totalItems = totalItems;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
}