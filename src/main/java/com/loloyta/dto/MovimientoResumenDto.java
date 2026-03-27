package com.loloyta.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MovimientoResumenDto {

    private String tipo;
    private LocalDateTime fecha;
    private String referencia;
    private Integer totalItems;
    private BigDecimal importeTotal;

    public MovimientoResumenDto() {
    }

    public MovimientoResumenDto(String tipo, LocalDateTime fecha, String referencia, Integer totalItems, BigDecimal importeTotal) {
        this.tipo = tipo;
        this.fecha = fecha;
        this.referencia = referencia;
        this.totalItems = totalItems;
        this.importeTotal = importeTotal;
        
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

	public BigDecimal getImporteTotal() {
		return importeTotal;
	}

	public void setImporteTotal(BigDecimal importeTotal) {
		this.importeTotal = importeTotal;
	}
    
    
}