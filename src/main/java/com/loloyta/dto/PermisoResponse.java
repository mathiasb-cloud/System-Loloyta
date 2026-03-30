package com.loloyta.dto;

public class PermisoResponse {

    private Long id;
    private String codigo;
    private String modulo;
    private String accion;
    private String descripcion;
    private Boolean activo;
    private Boolean asignado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getModulo() { return modulo; }
    public void setModulo(String modulo) { this.modulo = modulo; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Boolean getAsignado() { return asignado; }
    public void setAsignado(Boolean asignado) { this.asignado = asignado; }
}