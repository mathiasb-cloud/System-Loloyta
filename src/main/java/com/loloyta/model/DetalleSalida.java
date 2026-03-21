package com.loloyta.model;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "detalle_salida")
public class DetalleSalida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "salida_id")
    private Salida salida;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(name = "cantidad_pedido")
    private BigDecimal cantidadPedido;

    @Column(name = "cantidad_despacho")
    private BigDecimal cantidadDespacho;

    public DetalleSalida() {}

    public DetalleSalida(Salida salida, Producto producto,
                         BigDecimal cantidadPedido, BigDecimal cantidadDespacho) {
        this.salida = salida;
        this.producto = producto;
        this.cantidadPedido = cantidadPedido;
        this.cantidadDespacho = cantidadDespacho;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Salida getSalida() { return salida; }
    public void setSalida(Salida salida) { this.salida = salida; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public BigDecimal getCantidadPedido() { return cantidadPedido; }
    public void setCantidadPedido(BigDecimal cantidadPedido) { this.cantidadPedido = cantidadPedido; }

    public BigDecimal getCantidadDespacho() { return cantidadDespacho; }
    public void setCantidadDespacho(BigDecimal cantidadDespacho) { this.cantidadDespacho = cantidadDespacho; }
}