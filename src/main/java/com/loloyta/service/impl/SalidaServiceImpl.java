package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleSalida;
import com.loloyta.model.Movimiento;
import com.loloyta.model.Salida;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.DetalleSalidaRepository;
import com.loloyta.repository.LocalesRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.SalidaRepository;
import com.loloyta.service.AccesoAlmacenService;
import com.loloyta.service.AuthService;
import com.loloyta.service.SalidaService;
import com.loloyta.service.StockService;

@Service
public class SalidaServiceImpl implements SalidaService {
	
	@Autowired
	private AuthService authService;

    @Autowired
    private SalidaRepository salidaRepository;

    @Autowired
    private DetalleSalidaRepository detalleRepository;

    @Autowired
    private StockService stockService;
    
    @Autowired
    private AccesoAlmacenService accesoAlmacenService;

    @Autowired
    private MovimientoRepository movimientoRepository;
    
    @Autowired
    private LocalesRepository localesRepository;

    @Autowired
    private AlmacenesRepository almacenesRepository;

    @Override
    public List<Salida> listar() {
        return salidaRepository.findAll();
    }

    @Override
    public Optional<Salida> obtenerPorId(Long id) {
        return salidaRepository.findById(id);
    }

    @Override
    public Salida crear(Salida salida) {
    	
    	accesoAlmacenService.validarAccesoAlmacen(salida.getAlmacenes().getId());

    if (salida.getAlmacenes() == null || salida.getAlmacenes().getId() == null) {
        throw new RuntimeException("Debe seleccionar un almacén");
    }

    if (salida.getLocales() == null || salida.getLocales().getId() == null) {
        throw new RuntimeException("Debe seleccionar un local destino");
    }

    var almacen = almacenesRepository.findById(salida.getAlmacenes().getId())
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

    var local = localesRepository.findById(salida.getLocales().getId())
            .orElseThrow(() -> new RuntimeException("Local no encontrado"));

    if (local.getAlmacen() == null || local.getAlmacen().getId() == null) {
        throw new RuntimeException("El local seleccionado no tiene un almacén asociado");
    }

    if (!local.getAlmacen().getId().equals(almacen.getId())) {
        throw new RuntimeException("La salida solo puede realizarse al local que pertenece a ese almacén");
    }

    salida.setAlmacenes(almacen);
    salida.setLocales(local);
    salida.setUsuario(authService.obtenerUsuarioAutenticado());
    salida.setEstado("PENDIENTE");
    salida.setFecha(LocalDateTime.now());

    return salidaRepository.save(salida);
}

    @Override
    public Salida actualizar(Long id, Salida salidaActualizada) {

    Salida salida = salidaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

    if (salidaActualizada.getAlmacenes() == null || salidaActualizada.getAlmacenes().getId() == null) {
        throw new RuntimeException("Debe seleccionar un almacén");
    }

    if (salidaActualizada.getLocales() == null || salidaActualizada.getLocales().getId() == null) {
        throw new RuntimeException("Debe seleccionar un local destino");
    }

    var almacen = almacenesRepository.findById(salidaActualizada.getAlmacenes().getId())
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

    var local = localesRepository.findById(salidaActualizada.getLocales().getId())
            .orElseThrow(() -> new RuntimeException("Local no encontrado"));

    if (local.getAlmacen() == null || local.getAlmacen().getId() == null) {
        throw new RuntimeException("El local seleccionado no tiene un almacén asociado");
    }

    if (!local.getAlmacen().getId().equals(almacen.getId())) {
        throw new RuntimeException("La salida solo puede realizarse al local que pertenece a ese almacén");
    }

    salida.setAlmacenes(almacen);
    salida.setLocales(local);
    salida.setUsuario(authService.obtenerUsuarioAutenticado());

    return salidaRepository.save(salida);
}

    @Override
    public void eliminar(Long id) {
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        if (!"PENDIENTE".equals(salida.getEstado())) {
            throw new RuntimeException("Solo se puede cancelar una salida en estado PENDIENTE");
        }

        detalleRepository.deleteBySalidaId(id);
        salidaRepository.deleteById(id);
    }

    @Override
    public Salida confirmar(Long id) {

        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));

        if ("CONFIRMADA".equals(salida.getEstado())) {
            return salida;
        }

        salida.setEstado("CONFIRMADA");

        List<DetalleSalida> detalles = detalleRepository.findBySalidaId(id);

        for (DetalleSalida d : detalles) {

            BigDecimal cantidadDespacho = d.getCantidadDespacho();

            
            stockService.disminuirStock(
            	    d.getProducto().getId(),
            	    salida.getAlmacenes().getId(),
            	    d.getCantidadDespacho()
            	);
            
            if ("ALMACEN".equalsIgnoreCase(salida.getTipoDestino()) && salida.getAlmacenDestino() != null) {
                stockService.aumentarStock(
                        d.getProducto().getId(),
                        salida.getAlmacenDestino().getId(),
                        d.getCantidadDespacho()
                );

                Movimiento ingresoDestino = new Movimiento();
                ingresoDestino.setTipo("INGRESO");
                ingresoDestino.setCantidad(cantidadDespacho);
                ingresoDestino.setFecha(LocalDateTime.now());
                ingresoDestino.setAlmacen(salida.getAlmacenDestino());
                ingresoDestino.setUsuario(authService.obtenerUsuarioAutenticado());
                ingresoDestino.setProducto(d.getProducto());
                ingresoDestino.setSalida(salida);

                movimientoRepository.save(ingresoDestino);
            }

            
            Movimiento mov = new Movimiento();

            mov.setTipo("SALIDA");
            mov.setCantidad(cantidadDespacho);
            mov.setFecha(LocalDateTime.now());
            mov.setAlmacen(salida.getAlmacenes());
            mov.setUsuario(salida.getUsuario());
            mov.setSalida(salida);
            mov.setProducto(d.getProducto());

            movimientoRepository.save(mov);
        }

        return salidaRepository.save(salida);
    }
}