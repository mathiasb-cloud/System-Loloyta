package com.loloyta.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "almacenes")
public class Almacenes {




    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nombre;

    private String ubicacion;

    private boolean activo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
