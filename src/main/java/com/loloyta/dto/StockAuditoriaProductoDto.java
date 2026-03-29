package com.loloyta.dto;

public class StockAuditoriaProductoDto {

    private Long productoId;
    private String nombre;
    private String descripcion;
    private String categoria;
    private String unidadMedida;
    private Double stockMinimo;
    private Double precioActual;

    private Boolean asignado;
    private Long proveedorId;
    private String proveedorNombre;
    private String cantidadActual;

    public StockAuditoriaProductoDto() {
    }

    public StockAuditoriaProductoDto(Long productoId, String nombre, String descripcion,
                                     String categoria, String unidadMedida,
                                     Double stockMinimo, Double precioActual,
                                     Boolean asignado, Long proveedorId,
                                     String proveedorNombre, String cantidadActual) {
        this.productoId = productoId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.unidadMedida = unidadMedida;
        this.stockMinimo = stockMinimo;
        this.precioActual = precioActual;
        this.asignado = asignado;
        this.proveedorId = proveedorId;
        this.proveedorNombre = proveedorNombre;
        this.cantidadActual = cantidadActual;
    }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public Double getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Double stockMinimo) { this.stockMinimo = stockMinimo; }

    public Double getPrecioActual() { return precioActual; }
    public void setPrecioActual(Double precioActual) { this.precioActual = precioActual; }

    public Boolean getAsignado() { return asignado; }
    public void setAsignado(Boolean asignado) { this.asignado = asignado; }

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }

    public String getProveedorNombre() { return proveedorNombre; }
    public void setProveedorNombre(String proveedorNombre) { this.proveedorNombre = proveedorNombre; }

    public String getCantidadActual() { return cantidadActual; }
    public void setCantidadActual(String cantidadActual) { this.cantidadActual = cantidadActual; }
}