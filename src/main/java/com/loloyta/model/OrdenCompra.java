package com.loloyta.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;

    private String metodoPago;

    private BigDecimal montoTotal;

    private String estado;

    @ManyToOne
    @JoinColumn(name = "creado_por")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "almacen_id")
    private Almacenes almacenes;

    @OneToMany(mappedBy = "ordenCompra")
    private List<DetalleOrdenCompra> detalles;

}