package com.loloyta.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.loloyta.model.DetalleMovimiento;
import com.loloyta.model.DetalleSalida;
import com.loloyta.model.Movimiento;
import com.loloyta.model.Salida;
import com.loloyta.model.Stock;
import com.loloyta.repository.AlmacenesRepository;
import com.loloyta.repository.DetalleMovimientoRepository;
import com.loloyta.repository.DetalleSalidaRepository;
import com.loloyta.repository.LocalesRepository;
import com.loloyta.repository.MovimientoRepository;
import com.loloyta.repository.SalidaRepository;
import com.loloyta.service.AccesoAlmacenService;
import com.loloyta.service.AuthService;
import com.loloyta.service.SalidaService;
import com.loloyta.service.StockLoteService;
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
    
    @Autowired
    private DetalleMovimientoRepository detalleMovimientoRepository;
    
    @Autowired
    private StockLoteService stockLoteService;

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

    if (salida.getAlmacenes() == null || salida.getAlmacenes().getId() == null) {
        throw new RuntimeException("Debe seleccionar un almacén");
    }

    accesoAlmacenService.validarAccesoAlmacen(salida.getAlmacenes().getId());

    var almacen = almacenesRepository.findById(salida.getAlmacenes().getId())
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

    if (salida.getTipoDestino() == null || salida.getTipoDestino().isBlank()) {
        throw new RuntimeException("Debe indicar el tipo de destino");
    }

    if ("LOCAL".equalsIgnoreCase(salida.getTipoDestino())) {

        if (salida.getLocales() == null || salida.getLocales().getId() == null) {
            throw new RuntimeException("Debe seleccionar un local destino");
        }

        var local = localesRepository.findById(salida.getLocales().getId())
                .orElseThrow(() -> new RuntimeException("Local no encontrado"));

        if (local.getAlmacen() == null || local.getAlmacen().getId() == null) {
            throw new RuntimeException("El local seleccionado no tiene un almacén asociado");
        }

        if (!local.getAlmacen().getId().equals(almacen.getId())) {
            throw new RuntimeException("La salida al local solo puede realizarse al local que pertenece a ese almacén");
        }

        salida.setAlmacenes(almacen);
        salida.setLocales(local);
        salida.setAlmacenDestino(null);
    }

    else if ("ALMACEN".equalsIgnoreCase(salida.getTipoDestino())) {

        if (!accesoAlmacenService.puedeSalidaEntreAlmacenes()) {
            throw new RuntimeException("No tiene permiso para realizar salidas a otro almacén");
        }

        if (salida.getAlmacenDestino() == null || salida.getAlmacenDestino().getId() == null) {
            throw new RuntimeException("Debe seleccionar un almacén destino");
        }

        var almacenDestino = almacenesRepository.findById(salida.getAlmacenDestino().getId())
                .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));

        if (almacenDestino.getId().equals(almacen.getId())) {
            throw new RuntimeException("El almacén destino debe ser distinto al almacén origen");
        }

        salida.setAlmacenes(almacen);
        salida.setAlmacenDestino(almacenDestino);
        salida.setLocales(null);
    }

    else {
        throw new RuntimeException("Tipo de destino inválido");
    }

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

    accesoAlmacenService.validarAccesoAlmacen(salidaActualizada.getAlmacenes().getId());

    var almacen = almacenesRepository.findById(salidaActualizada.getAlmacenes().getId())
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

    if (salidaActualizada.getTipoDestino() == null || salidaActualizada.getTipoDestino().isBlank()) {
        throw new RuntimeException("Debe indicar el tipo de destino");
    }

    if ("LOCAL".equalsIgnoreCase(salidaActualizada.getTipoDestino())) {

        if (salidaActualizada.getLocales() == null || salidaActualizada.getLocales().getId() == null) {
            throw new RuntimeException("Debe seleccionar un local destino");
        }

        var local = localesRepository.findById(salidaActualizada.getLocales().getId())
                .orElseThrow(() -> new RuntimeException("Local no encontrado"));

        if (local.getAlmacen() == null || local.getAlmacen().getId() == null) {
            throw new RuntimeException("El local seleccionado no tiene un almacén asociado");
        }

        if (!local.getAlmacen().getId().equals(almacen.getId())) {
            throw new RuntimeException("La salida al local solo puede realizarse al local que pertenece a ese almacén");
        }

        salida.setAlmacenes(almacen);
        salida.setLocales(local);
        salida.setAlmacenDestino(null);
        salida.setTipoDestino("LOCAL");
    }

    else if ("ALMACEN".equalsIgnoreCase(salidaActualizada.getTipoDestino())) {

        if (!accesoAlmacenService.puedeSalidaEntreAlmacenes()) {
            throw new RuntimeException("No tiene permiso para realizar salidas a otro almacén");
        }

        if (salidaActualizada.getAlmacenDestino() == null || salidaActualizada.getAlmacenDestino().getId() == null) {
            throw new RuntimeException("Debe seleccionar un almacén destino");
        }

        var almacenDestino = almacenesRepository.findById(salidaActualizada.getAlmacenDestino().getId())
                .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));

        if (almacenDestino.getId().equals(almacen.getId())) {
            throw new RuntimeException("El almacén destino debe ser distinto al almacén origen");
        }

        salida.setAlmacenes(almacen);
        salida.setAlmacenDestino(almacenDestino);
        salida.setLocales(null);
        salida.setTipoDestino("ALMACEN");
    }

    else {
        throw new RuntimeException("Tipo de destino inválido");
    }

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

        BigDecimal cantidadDespacho = d.getCantidadDespacho() != null
                ? d.getCantidadDespacho()
                : BigDecimal.ZERO;

        BigDecimal stockAntesOrigen = BigDecimal.ZERO;
        BigDecimal stockAntesDestino = BigDecimal.ZERO;

        Stock stockOrigenActual = stockService.obtenerPorProductoYAlmacen(
                d.getProducto().getId(),
                salida.getAlmacenes().getId()
        );

        if (stockOrigenActual != null && stockOrigenActual.getCantidad() != null) {
            stockAntesOrigen = stockOrigenActual.getCantidad();
        }

        if ("ALMACEN".equalsIgnoreCase(salida.getTipoDestino()) && salida.getAlmacenDestino() != null) {
            Stock stockDestinoActual = stockService.obtenerPorProductoYAlmacen(
                    d.getProducto().getId(),
                    salida.getAlmacenDestino().getId()
            );

            if (stockDestinoActual != null && stockDestinoActual.getCantidad() != null) {
                stockAntesDestino = stockDestinoActual.getCantidad();
            }
        }

        stockService.disminuirStock(
                d.getProducto().getId(),
                salida.getAlmacenes().getId(),
                cantidadDespacho
        );
        
        stockLoteService.descontarFIFO(
        	    d.getProducto().getId(),
        	    salida.getAlmacenes().getId(),
        	    cantidadDespacho.doubleValue()
        	);

        if ("ALMACEN".equalsIgnoreCase(salida.getTipoDestino()) && salida.getAlmacenDestino() != null) {
            stockService.aumentarStock(
                    d.getProducto().getId(),
                    salida.getAlmacenDestino().getId(),
                    cantidadDespacho
            );
        }
        
        stockService.disminuirStock(
                d.getProducto().getId(),
                salida.getAlmacenes().getId(),
                cantidadDespacho
        );

        Movimiento mov = new Movimiento();

        if ("ALMACEN".equalsIgnoreCase(salida.getTipoDestino()) && salida.getAlmacenDestino() != null) {
            mov.setTipo("TRASPASO");
            mov.setAlmacenDestino(salida.getAlmacenDestino());
        } else {
            mov.setTipo("SALIDA");
        }

        mov.setCantidad(cantidadDespacho);
        mov.setFecha(LocalDateTime.now());
        mov.setAlmacen(salida.getAlmacenes());
        mov.setUsuario(authService.obtenerUsuarioAutenticado());
        mov.setSalida(salida);
        mov.setProducto(d.getProducto());

        movimientoRepository.save(mov);

        if ("TRASPASO".equalsIgnoreCase(mov.getTipo())) {
            BigDecimal stockDespuesOrigen = stockAntesOrigen.subtract(cantidadDespacho);
            BigDecimal stockDespuesDestino = stockAntesDestino.add(cantidadDespacho);

            DetalleMovimiento detalleMov = new DetalleMovimiento();
            detalleMov.setMovimiento(mov);
            detalleMov.setProducto(d.getProducto());
            detalleMov.setCantidad(cantidadDespacho);
            detalleMov.setStockAntesOrigen(stockAntesOrigen);
            detalleMov.setStockDespuesOrigen(stockDespuesOrigen);
            detalleMov.setStockAntesDestino(stockAntesDestino);
            detalleMov.setStockDespuesDestino(stockDespuesDestino);

            detalleMovimientoRepository.save(detalleMov);
        }
    }

    return salidaRepository.save(salida);
}
}