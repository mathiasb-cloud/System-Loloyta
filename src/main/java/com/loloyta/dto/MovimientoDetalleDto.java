package com.loloyta.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class MovimientoDetalleDto {

    private String referencia;
    private String tipo;
    private LocalDateTime fecha;
    private String almacenNombre;

    private String usuarioNombre;

    private Long ordenCompraId;
    private LocalDateTime ordenCompraFecha;
    private String ordenCompraMetodoPago;
    private Double ordenCompraMontoTotal;
    private String ordenCompraEstado;

    private Long salidaId;
    private LocalDateTime salidaFecha;
    private String salidaEstado;
    private String localDestinoNombre;

    private Integer totalItems;
    private BigDecimal importeTotalCalculado;

    private List<MovimientoDetalleItemDto> productos;

    public MovimientoDetalleDto() {
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
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

    public String getAlmacenNombre() {
        return almacenNombre;
    }

    public void setAlmacenNombre(String almacenNombre) {
        this.almacenNombre = almacenNombre;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public Long getOrdenCompraId() {
        return ordenCompraId;
    }

    public void setOrdenCompraId(Long ordenCompraId) {
        this.ordenCompraId = ordenCompraId;
    }

    public LocalDateTime getOrdenCompraFecha() {
        return ordenCompraFecha;
    }

    public void setOrdenCompraFecha(LocalDateTime ordenCompraFecha) {
        this.ordenCompraFecha = ordenCompraFecha;
    }

    public String getOrdenCompraMetodoPago() {
        return ordenCompraMetodoPago;
    }

    public void setOrdenCompraMetodoPago(String ordenCompraMetodoPago) {
        this.ordenCompraMetodoPago = ordenCompraMetodoPago;
    }

    public Double getOrdenCompraMontoTotal() {
        return ordenCompraMontoTotal;
    }

    public void setOrdenCompraMontoTotal(Double ordenCompraMontoTotal) {
        this.ordenCompraMontoTotal = ordenCompraMontoTotal;
    }

    public String getOrdenCompraEstado() {
        return ordenCompraEstado;
    }

    public void setOrdenCompraEstado(String ordenCompraEstado) {
        this.ordenCompraEstado = ordenCompraEstado;
    }

    public Long getSalidaId() {
        return salidaId;
    }

    public void setSalidaId(Long salidaId) {
        this.salidaId = salidaId;
    }

    public LocalDateTime getSalidaFecha() {
        return salidaFecha;
    }

    public void setSalidaFecha(LocalDateTime salidaFecha) {
        this.salidaFecha = salidaFecha;
    }

    public String getSalidaEstado() {
        return salidaEstado;
    }

    public void setSalidaEstado(String salidaEstado) {
        this.salidaEstado = salidaEstado;
    }

    public String getLocalDestinoNombre() {
        return localDestinoNombre;
    }

    public void setLocalDestinoNombre(String localDestinoNombre) {
        this.localDestinoNombre = localDestinoNombre;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getImporteTotalCalculado() {
        return importeTotalCalculado;
    }

    public void setImporteTotalCalculado(BigDecimal importeTotalCalculado) {
        this.importeTotalCalculado = importeTotalCalculado;
    }

    public List<MovimientoDetalleItemDto> getProductos() {
        return productos;
    }

    public void setProductos(List<MovimientoDetalleItemDto> productos) {
        this.productos = productos;
    }
}