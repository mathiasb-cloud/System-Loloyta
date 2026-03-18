package com.loloyta.dto;

import java.time.LocalDateTime;

public class MovimientoResumenDTO {

    private String tipo;
    private LocalDateTime fecha;
    private Long referenciaId;
    private int totalItems;

    public MovimientoResumenDTO(String tipo, LocalDateTime fecha, Long referenciaId, int totalItems) {
        this.tipo = tipo;
        this.fecha = fecha;
        this.referenciaId = referenciaId;
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

	public Long getReferenciaId() {
		return referenciaId;
	}

	public void setReferenciaId(Long referenciaId) {
		this.referenciaId = referenciaId;
	}

	public int getTotalItems() {
		return totalItems;
	}

	public void setTotalItems(int totalItems) {
		this.totalItems = totalItems;
	}

    
}