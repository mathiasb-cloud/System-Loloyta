package com.loloyta.service;

public interface AutorizacionService {

    void validarPermiso(String permisoCodigo);

    boolean tienePermiso(String permisoCodigo);
}