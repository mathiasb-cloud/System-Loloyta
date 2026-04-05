package com.loloyta.dto;

import java.math.BigDecimal;

public class MovimientoDetalleItemDto {

    private Long productoId;
    private String productoNombre;
    private String descripcion;
    private String categoria;
    private String unidadMedida;
    private Double stockMinimo;
    private Boolean activo;
    private Double precioActual;
    private BigDecimal cantidad;
    private BigDecimal importe;
    private String metodoPago;
    private BigDecimal stockAntesOrigen;
    private BigDecimal stockDespuesOrigen;
    private BigDecimal stockAntesDestino;
    private BigDecimal stockDespuesDestino;

    public MovimientoDetalleItemDto() {
    }

    public MovimientoDetalleItemDto(Long productoId, String productoNombre, String descripcion, String categoria,
                                    String unidadMedida, Double stockMinimo, Boolean activo, Double precioActual,
                                    BigDecimal cantidad, BigDecimal importe, String metodoPago) {
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.unidadMedida = unidadMedida;
        this.stockMinimo = stockMinimo;
        this.activo = activo;
        this.precioActual = precioActual;
        this.cantidad = cantidad;
        this.importe = importe;
        this.metodoPago = metodoPago;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public Double getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Double stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Double getPrecioActual() {
        return precioActual;
    }

    public void setPrecioActual(Double precioActual) {
        this.precioActual = precioActual;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getImporte() {
        return importe;
    }

    public void setImporte(BigDecimal importe) {
        this.importe = importe;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
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