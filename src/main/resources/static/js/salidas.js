let salidaId = null;
let productosSalidaGlobal = [];
let buscadorSalidaClickRegistrado = false;
let productoSeleccionadoTemp = null; 
let modalLotesInstance = null;

async function initSalidas() {
    await cargarAlmacenesSalida();
    await cargarLocalAutomaticoPorAlmacenSalida();
    await cargarAlmacenesDestinoSalida();

    await configurarTipoDestinoSalida();
    
    // Inicializar Modal de Lotes
    const modalEl = document.getElementById('modalSeleccionLote');
    if (modalEl) {
        modalLotesInstance = new bootstrap.Modal(modalEl);
    }

    document.getElementById("almacenSalida")?.addEventListener("change", async () => {
        await cargarLocalAutomaticoPorAlmacenSalida();
        await cargarAlmacenesDestinoSalida();
        await cargarProductosSalidaPorAlmacen();

        actualizarFlujoSalidaVisual();
        actualizarResumenSalida();

        const resultadosDiv = document.getElementById("resultadosSalida");
        const input = document.getElementById("buscadorSalida");

        if (resultadosDiv) resultadosDiv.innerHTML = "";
        if (input) input.value = "";
    });

    document.getElementById("localSalida")?.addEventListener("change", () => {
        actualizarFlujoSalidaVisual();
    });

    document.getElementById("almacenDestinoSalida")?.addEventListener("change", async () => {
        await cargarProductosSalidaPorAlmacen();
        actualizarFlujoSalidaVisual();
    });

    configurarBuscadorSalida();
    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
    actualizarResumenSalida();

    if (document.getElementById("almacenSalida")?.value) {
        await cargarProductosSalidaPorAlmacen();
    }
}

function configurarTipoDestinoSalida() {
    const selectTipo = document.getElementById("tipoDestinoSalida");
    const bloqueLocal = document.getElementById("bloqueLocalSalida");
    const bloqueAlmacen = document.getElementById("bloqueAlmacenDestinoSalida");
    const localSelect = document.getElementById("localSalida");
    const almacenDestinoSelect = document.getElementById("almacenDestinoSalida");

    if (!selectTipo || !bloqueLocal || !bloqueAlmacen) return;

    const actualizarVista = async () => {
        const tipo = selectTipo.value;

        if (tipo === "ALMACEN") {
            bloqueLocal.classList.add("d-none");
            bloqueAlmacen.classList.remove("d-none");

            if (localSelect) {
                localSelect.value = "";
            }

            await cargarAlmacenesDestinoSalida();
        } else {
            bloqueLocal.classList.remove("d-none");
            bloqueAlmacen.classList.add("d-none");

            if (almacenDestinoSelect) {
                almacenDestinoSelect.value = "";
            }
        }

        await cargarProductosSalidaPorAlmacen();
        actualizarFlujoSalidaVisual();
    };

    selectTipo.onchange = actualizarVista;
    actualizarVista();
}

async function cargarAlmacenesDestinoSalida() {
    const select = document.getElementById("almacenDestinoSalida");
    const almacenOrigenId = document.getElementById("almacenSalida")?.value;

    if (!select) return;

    try {
        const res = await fetch("/api/almacenes", { credentials: "include" });
        if (!res.ok) throw new Error("No se pudieron cargar los almacenes destino.");

        const data = await res.json();
        const valorActual = select.value;

        select.innerHTML = `<option value="">Seleccione almacén destino</option>`;

        data.filter(a => a.activo !== false)
            .filter(a => String(a.id) !== String(almacenOrigenId || ""))
            .forEach(a => {
                select.innerHTML += `<option value="${a.id}">${escapeHtml(a.nombre)}</option>`;
            });

        const existeValorActual = [...select.options].some(o => String(o.value) === String(valorActual));
        select.value = existeValorActual ? valorActual : "";

    } catch (error) {
        console.error(error);
    }
}

function configurarBuscadorSalida() {
    const input = document.getElementById("buscadorSalida");
    const resultadosDiv = document.getElementById("resultadosSalida");

    if (!input || !resultadosDiv) return;

    input.addEventListener("input", function () {
        const texto = this.value.toLowerCase().trim();
        resultadosDiv.innerHTML = "";

        const almacenId = document.getElementById("almacenSalida")?.value;

        if (!almacenId) {
            resultadosDiv.innerHTML = `<div class="list-group-item text-muted small">Selecciona un almacén para buscar productos.</div>`;
            return;
        }

        if (!texto) return;

        // Se elimina el filtro de "idsAgregados" porque un mismo producto puede salir de múltiples lotes
        const filtrados = productosSalidaGlobal
            .filter(p => p.nombre.toLowerCase().includes(texto))
            .slice(0, 8);

        if (filtrados.length === 0) {
            resultadosDiv.innerHTML = `<div class="list-group-item text-muted small">No se encontraron productos.</div>`;
            return;
        }

		filtrados.forEach(p => {
		    const stockActual = Number(p.stockActual || 0);
		    const stockMinimo = Number(p.stockMinimo || 0);
		    const claseStock = stockActual === 0 ? "text-danger" : stockActual <= stockMinimo ? "text-danger" : "text-success";
		    const agotado = stockActual === 0;

		    const item = document.createElement("button");
		    item.type = "button";
		    item.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center ${agotado ? "producto-agotado-item" : ""}`;
		    item.disabled = agotado;

		    item.innerHTML = `
		        <div class="text-start ${agotado ? "producto-agotado-texto" : ""}">
		            <div class="fw-medium">${escapeHtml(p.nombre)}</div>
		            <small class="text-muted d-block">${escapeHtml(p.categoria?.nombre || "")}</small>
		        </div>
		        <div class="d-flex align-items-center gap-3 bloque-derecha">
		            <div class="precio-item ${agotado ? "producto-agotado-texto" : ""}">
		                <span class="label-precio">Precio Ref:</span>
		                <span class="valor-precio">${Number(p.precioActual || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</span>
		            </div>
		            <div class="text-end">
		                <small class="text-muted d-block ${agotado ? "producto-agotado-texto" : ""}">${escapeHtml(p.unidadMedida || "")}</small>
		                <small class="${claseStock} fw-semibold d-block">Stock: ${stockActual}</small>
		            </div>
		        </div>
		    `;

		    if (!agotado) {
		        item.addEventListener("click", (e) => {
		            e.preventDefault();
		            e.stopPropagation();

                    // AQUÍ CAMBIA: Abrimos modal de lotes
		            seleccionarProductoParaSalida(p);

		            input.value = "";
		            resultadosDiv.innerHTML = "";
		            input.blur();
		        });
		    }
		    resultadosDiv.appendChild(item);
		});
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") resultadosDiv.innerHTML = "";
    });

    if (!buscadorSalidaClickRegistrado) {
        document.addEventListener("click", function (e) {
            const inputActual = document.getElementById("buscadorSalida");
            const resultadosActual = document.getElementById("resultadosSalida");
            if (!inputActual || !resultadosActual) return;
            if (!resultadosActual.contains(e.target) && e.target !== inputActual) {
                resultadosActual.innerHTML = "";
            }
        });
        buscadorSalidaClickRegistrado = true;
    }
}

// -------------------------------------------------------------
// NUEVA SECCIÓN DE LOTES 
// -------------------------------------------------------------
async function seleccionarProductoParaSalida(producto) {
    const almacenId = document.getElementById("almacenSalida").value;
    productoSeleccionadoTemp = producto;
    document.getElementById("nombreProductoLote").textContent = producto.nombre;
    
    await cargarLotesDisponibles(producto.id, almacenId);
}

async function cargarLotesDisponibles(productoId, almacenId) {
    try {
        mostrarCargandoSalida("Buscando lotes disponibles...");
        const res = await fetch(`/api/lotes/disponibles?productoId=${productoId}&almacenId=${almacenId}`);
        if (!res.ok) throw new Error("Error al consultar lotes.");
        
        const lotes = await res.json();
        cerrarCargandoSalida();

        const tbody = document.querySelector("#tablaLotesDisponibles tbody");
        tbody.innerHTML = "";

        if (lotes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger py-4">No hay stock disponible de este producto en el almacén.</td></tr>`;
        } else {
            lotes.forEach(lote => {
                const fecha = new Date(lote.fechaIngreso).toLocaleDateString('es-PE');
                const codigo = lote.codigoLote || `LT-${lote.loteId}`;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="fw-bold">${codigo}</td>
                    <td>${fecha}</td>
                    <td class="text-success fw-bold">${lote.cantidadDisponible}</td>
                    <td>
                        <input type="number" class="form-control text-center cant-extraer" id="input_lote_${lote.loteId}" min="0.01" max="${lote.cantidadDisponible}" step="0.01" placeholder="0">
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm w-100" onclick='agregarLoteATablaSalida(${JSON.stringify(lote)})'>Agregar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        modalLotesInstance.show();
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida("No se pudieron cargar los lotes.");
    }
}

function agregarLoteATablaSalida(lote) {
    const inputCantidad = document.getElementById(`input_lote_${lote.loteId}`);
    const cantidadRequerida = Number(inputCantidad.value);

    if (cantidadRequerida <= 0 || cantidadRequerida > lote.cantidadDisponible) {
        mostrarInfoSalida(`Ingresa una cantidad válida. Máximo disponible: ${lote.cantidadDisponible}`);
        return;
    }

    const tbody = document.querySelector("#tablaSalida tbody");
    
    // Validar si ese LOTE en específico ya está en la tabla
    const yaExiste = [...tbody.querySelectorAll("tr")].some(tr => String(tr.dataset.loteid) === String(lote.loteId));
    if (yaExiste) {
        mostrarInfoSalida("Este lote ya está en la lista. Puedes modificar su cantidad en la tabla principal.");
        return;
    }

    const producto = productoSeleccionadoTemp;
    const stockMinimo = Number(producto.stockMinimo || 0);
    const codigoLote = lote.codigoLote || `LT-${lote.loteId}`;
    const precio = Number(producto.precioActual || lote.costoUnitario || 0);

    const fila = document.createElement("tr");
    fila.dataset.id = producto.id;
    fila.dataset.loteid = lote.loteId;
    fila.dataset.stockActual = lote.cantidadDisponible; // Ahora el stock es el disponible del lote
    fila.dataset.stockMinimo = stockMinimo;

    fila.innerHTML = `
        <td>${escapeHtml(producto.categoria?.nombre || "-")}</td>
        <td>
            ${escapeHtml(producto.nombre || "-")} 
            <br><span class="badge bg-secondary mt-1">${codigoLote}</span>
        </td>
        <td>${escapeHtml(producto.unidadMedida || "-")}</td>
        <td class="text-muted small">${lote.cantidadDisponible} max.</td>
        <td>
            <div class="cantidad-salida-wrap">
                <div class="cantidad-alerta-container"></div>
                <input type="number"
                       class="form-control cantidad-salida-item text-center"
                       value="${cantidadRequerida}"
                       max="${lote.cantidadDisponible}"
                       min="0.01"
                       step="0.01">
            </div>
        </td>
        <td class="precio-item">${precio.toFixed(2)}</td>
        <td class="subtotal-item fw-semibold text-center">S/ 0.00</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="eliminarFilaSalida(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(fila);

    const input = fila.querySelector(".cantidad-salida-item");

    input?.addEventListener("input", function() {
        if (Number(this.value) > lote.cantidadDisponible) {
            mostrarInfoSalida("No puedes exceder el stock disponible de este lote.");
            this.value = lote.cantidadDisponible;
        }
        recalcularFilaSalida(fila);
        actualizarEstadoCantidadSalida(fila, true);
        actualizarResumenSalida();
    });

    input?.addEventListener("mouseenter", () => mostrarAlertaHoverCantidadSalida(fila));
    input?.addEventListener("mouseleave", () => ocultarAlertaCantidadSalida(fila));

    recalcularFilaSalida(fila);
    actualizarEstadoCantidadSalida(fila, true);
    actualizarResumenSalida();

    inputCantidad.value = ""; 
    modalLotesInstance.hide(); 
}

// -------------------------------------------------------------
// RESTO DE FUNCIONES EXISTENTES
// -------------------------------------------------------------

function recalcularFilaSalida(fila) {
    const cantidadInput = fila.querySelector(".cantidad-salida-item");
    const precioCell = fila.querySelector(".precio-item");
    const subtotalCell = fila.querySelector(".subtotal-item");

    const cantidad = Number(cantidadInput?.value || 0);
    const precio = Number(precioCell?.textContent || 0);
    const subtotal = cantidad * precio;

    if (subtotalCell) {
        subtotalCell.textContent = subtotal.toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        });
    }
}

async function cargarAlmacenesSalida() {
    const res = await fetch("/api/almacenes/mis-almacenes", { credentials: "include" })
    const data = await res.json();
    const select = document.getElementById("almacenSalida");
    if (!select) return;
    select.innerHTML = `<option value="">Seleccione almacén</option>`;
    data.forEach(a => select.innerHTML += `<option value="${a.id}">${escapeHtml(a.nombre)}</option>`);
}

async function cargarProductosSalidaPorAlmacen() {
    const almacenOrigenId = document.getElementById("almacenSalida")?.value;
    const tipoDestino = document.getElementById("tipoDestinoSalida")?.value || "LOCAL";
    const almacenDestinoId = document.getElementById("almacenDestinoSalida")?.value;

    productosSalidaGlobal = [];

    if (!almacenOrigenId) return;

    try {
        const resOrigen = await fetch(`/api/stock/almacen/${almacenOrigenId}`, { credentials: "include" });
        if (!resOrigen.ok) throw new Error("No se pudieron cargar los productos del almacén.");
        const dataOrigen = await resOrigen.json();

        let dataFiltrada = dataOrigen;

        if (tipoDestino === "ALMACEN" && almacenDestinoId) {
            const resDestino = await fetch(`/api/stock/almacen/${almacenDestinoId}`, { credentials: "include" });
            if (!resDestino.ok) throw new Error("No se pudieron cargar los productos del almacén destino.");
            const dataDestino = await resDestino.json();

            const idsDestino = new Set(
                (dataDestino || [])
                    .filter(s => s.producto && s.producto.activo !== false)
                    .map(s => String(s.producto.id))
            );

            dataFiltrada = (dataOrigen || []).filter(s =>
                s.producto && s.producto.activo !== false && idsDestino.has(String(s.producto.id))
            );
        }

        productosSalidaGlobal = dataFiltrada
            .filter(s => s.producto && s.producto.activo !== false)
            .map(s => ({
                ...s.producto,
                proveedor: s.proveedor || null,
                stockActual: Number(s.cantidad || 0)
            }));

    } catch (error) {
        console.error(error);
        mostrarErrorSalida(error.message || "No se pudieron cargar los productos del almacén.");
    }
}

function evaluarEstadoCantidadSalida(fila) {
    const input = fila.querySelector(".cantidad-salida-item");
    const stockActual = Number(fila.dataset.stockActual || 0); // Este ahora es el stock del lote
    const cantidad = Number(input?.value || 0);
    const restante = stockActual - cantidad;

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        return { tipo: "invalido", valido: false, restante, mensaje: "Ingresa una cantidad válida mayor a cero." };
    }

    if (restante < 0) {
        return { tipo: "negativo", valido: false, restante, mensaje: `El stock disponible del lote es ${formatearNumero(stockActual)}.` };
    }

    return { tipo: "ok", valido: true, restante, mensaje: "" };
}

function actualizarEstadoCantidadSalida(fila, mostrarTemporal = false) {
    const input = fila.querySelector(".cantidad-salida-item");
    if (!input) return;

    const estado = evaluarEstadoCantidadSalida(fila);
    input.classList.remove("salida-input-alerta-roja", "salida-input-alerta-amarilla", "is-invalid");

    if (estado.tipo === "negativo" || estado.tipo === "invalido") {
        input.classList.add("salida-input-alerta-roja", "is-invalid");
        if (mostrarTemporal) mostrarAlertaCantidadSalida(fila, estado.mensaje, "roja", true);
        return;
    }

    ocultarAlertaCantidadSalida(fila);
}

function mostrarAlertaHoverCantidadSalida(fila) {
    const estado = evaluarEstadoCantidadSalida(fila);
    if (estado.tipo === "negativo" || estado.tipo === "invalido") {
        mostrarAlertaCantidadSalida(fila, estado.mensaje, "roja", false);
    }
}

function mostrarAlertaCantidadSalida(fila, mensaje, color = "roja", autoOcultar = true) {
    const contenedor = fila.querySelector(".cantidad-alerta-container");
    if (!contenedor) return;

    contenedor.innerHTML = `<div class="cantidad-alerta-tooltip ${color === "amarilla" ? "cantidad-alerta-amarilla" : "cantidad-alerta-roja"} mostrar">${escapeHtml(mensaje)}</div>`;
    const alerta = contenedor.querySelector(".cantidad-alerta-tooltip");
    
    if (autoOcultar) {
        clearTimeout(contenedor._alertaTimeout);
        contenedor._alertaTimeout = setTimeout(() => {
            alerta.classList.remove("mostrar");
            alerta.classList.add("ocultar");
            setTimeout(() => { if (contenedor.contains(alerta)) contenedor.innerHTML = ""; }, 250);
        }, 3000);
    }
}

function ocultarAlertaCantidadSalida(fila) {
    const contenedor = fila.querySelector(".cantidad-alerta-container");
    if (!contenedor) return;
    clearTimeout(contenedor._alertaTimeout);
    const alerta = contenedor.querySelector(".cantidad-alerta-tooltip");
    if (!alerta) return;
    alerta.classList.remove("mostrar");
    alerta.classList.add("ocultar");
    setTimeout(() => { if (contenedor.contains(alerta)) contenedor.innerHTML = ""; }, 220);
}

function eliminarFilaSalida(btn) {
    btn.closest("tr").remove();
    actualizarResumenSalida();
}

function validarSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const tipoDestino = document.getElementById("tipoDestinoSalida")?.value || "LOCAL";
    const localId = document.getElementById("localSalida")?.value;
    const almacenDestinoId = document.getElementById("almacenDestinoSalida")?.value;
    const filas = document.querySelectorAll("#tablaSalida tbody tr");

    if (!almacenId) { mostrarInfoSalida("Selecciona un almacén."); return false; }
    if (tipoDestino === "LOCAL" && !localId) { mostrarInfoSalida("Selecciona un local destino."); return false; }
    if (tipoDestino === "ALMACEN" && !almacenDestinoId) { mostrarInfoSalida("Selecciona un almacén destino."); return false; }
    if (tipoDestino === "ALMACEN" && String(almacenDestinoId) === String(almacenId)) { mostrarInfoSalida("El almacén destino debe ser diferente al origen."); return false; }
    if (filas.length === 0) { mostrarInfoSalida("Agrega al menos un producto a la salida."); return false; }

    for (const fila of filas) {
        const estado = evaluarEstadoCantidadSalida(fila);
        if (!estado.valido) {
            const input = fila.querySelector(".cantidad-salida-item");
            input?.focus();
            actualizarEstadoCantidadSalida(fila, true);
            return false;
        }
    }
    return true;
}

async function guardarOSobrescribirSalida() {
    if (!validarSalida()) return;
    try {
        mostrarCargandoSalida(salidaId ? "Guardando cambios..." : "Guardando salida...");
        if (!salidaId) await crearSalida();
        else await guardarCambiosSalida();
        cerrarCargandoSalida();
        mostrarExitoSalida(salidaId ? "Cambios guardados correctamente." : "Salida guardada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida(error.message || "No se pudo guardar la salida.");
    }
}

async function crearSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const localId = document.getElementById("localSalida")?.value;
    const tipoDestino = document.getElementById("tipoDestinoSalida")?.value || "LOCAL";
    const almacenDestinoId = document.getElementById("almacenDestinoSalida")?.value;

    const payload = { almacenes: { id: Number(almacenId) }, tipoDestino };
    if (tipoDestino === "LOCAL") payload.locales = { id: Number(localId) };
    else payload.almacenDestino = { id: Number(almacenDestinoId) };

    const res = await fetch("/api/salidas", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await leerMensajeErrorSalida(res) || "No se pudo crear la salida.");
    const data = await res.json();
    salidaId = data.id;

    try {
        await guardarDetalleSalida();
    } catch (error) {
        await fetch(`/api/salidas/${salidaId}`, { method: "DELETE", credentials: "include" });
        salidaId = null;
        throw error;
    }

    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
}

// AQUÍ SE ENVÍA EL LOTE AL BACKEND
async function guardarDetalleSalida() {
    const filas = document.querySelectorAll("#tablaSalida tbody tr");

    for (let i = 0; i < filas.length; i++) {
        const input = filas[i].querySelector(".cantidad-salida-item");
        const cantidad = Number(input?.value || 0);

        const res = await fetch('/api/detalle-salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                salida: { id: salidaId },
                producto: { id: Number(filas[i].dataset.id) },
                lote: { loteId: Number(filas[i].dataset.loteid) }, // <--- EL LOTE ID MAGICO
                cantidadDespacho: cantidad
            })
        });

        if (!res.ok) throw new Error(await leerMensajeErrorSalida(res) || "No se pudo guardar un detalle de la salida.");
    }
}

async function guardarCambiosSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const localId = document.getElementById("localSalida")?.value;
    const tipoDestino = document.getElementById("tipoDestinoSalida")?.value || "LOCAL";
    const almacenDestinoId = document.getElementById("almacenDestinoSalida")?.value;

    const payload = { almacenes: { id: Number(almacenId) }, tipoDestino };
    if (tipoDestino === "LOCAL") payload.locales = { id: Number(localId) };
    else payload.almacenDestino = { id: Number(almacenDestinoId) };

    const resSalida = await fetch(`/api/salidas/${salidaId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload)
    });

    if (!resSalida.ok) throw new Error(await leerMensajeErrorSalida(resSalida) || "No se pudo actualizar la salida.");

    const resBorrarDetalle = await fetch(`/api/detalle-salida/salida/${salidaId}`, { method: "DELETE", credentials: "include" });
    if (!resBorrarDetalle.ok) throw new Error(await leerMensajeErrorSalida(resBorrarDetalle) || "No se pudo limpiar el detalle.");

    await guardarDetalleSalida();
    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
}

async function confirmarSalida() {
    if (!salidaId) return mostrarInfoSalida("Primero guarda la salida.");
    const ok = await confirmarSwalSalida("Confirmar salida", "Se descontará el stock del almacén.", "Sí, confirmar");
    if (!ok) return;

    try {
        mostrarCargandoSalida("Confirmando salida...");
        const res = await fetch(`/api/salidas/${salidaId}/confirmar`, { method: 'PATCH' });
        if (!res.ok) throw new Error(await leerMensajeErrorSalida(res) || "No se pudo confirmar la salida.");
        
        limpiarFormularioSalida();
        cerrarCargandoSalida();
        mostrarExitoSalida("Salida confirmada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida(error.message || "No se pudo confirmar la salida.");
    }
}

async function cancelarSalida() {
    if (!salidaId) return mostrarInfoSalida("No hay salida pendiente.");
    const ok = await confirmarSwalSalida("Cancelar salida", "Se eliminará la salida.", "Sí, cancelar");
    if (!ok) return;

    try {
        mostrarCargandoSalida("Cancelando salida...");
        const res = await fetch(`/api/salidas/${salidaId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await leerMensajeErrorSalida(res) || "No se pudo cancelar.");
        
        limpiarFormularioSalida();
        cerrarCargandoSalida();
        mostrarExitoSalida("Salida pendiente cancelada.");
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida(error.message);
    }
}

function limpiarFormularioSalida() {
    salidaId = null;
    const tbody = document.querySelector("#tablaSalida tbody");
    if (tbody) tbody.innerHTML = "";
    const buscador = document.getElementById("buscadorSalida");
    if (buscador) buscador.value = "";
    const resultados = document.getElementById("resultadosSalida");
    if (resultados) resultados.innerHTML = "";
    const almacenSelect = document.getElementById("almacenSalida");
    if (almacenSelect) almacenSelect.value = "";
    const localSelect = document.getElementById("localSalida");
    if (localSelect) localSelect.value = "";
    const tipoDestinoSelect = document.getElementById("tipoDestinoSalida");
    if (tipoDestinoSelect) tipoDestinoSelect.value = "LOCAL";
    const almacenDestinoSelect = document.getElementById("almacenDestinoSalida");
    if (almacenDestinoSelect) almacenDestinoSelect.value = "";

    configurarTipoDestinoSalida();
    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
    actualizarResumenSalida();
}

function actualizarEstadoBotonesSalida() {
    const textoGuardar = document.getElementById("textoBtnGuardarSalida");
    const btnConfirmar = document.getElementById("btnConfirmarSalida");
    const btnCancelar = document.getElementById("btnCancelarSalida");
    const yaGuardada = !!salidaId;

    if (textoGuardar) textoGuardar.textContent = yaGuardada ? "Guardar cambios" : "Guardar Salida";
    if (btnConfirmar) btnConfirmar.disabled = !yaGuardada;
    if (btnCancelar) btnCancelar.disabled = !yaGuardada;
}

function actualizarResumenSalida() {
    const filas = document.querySelectorAll("#tablaSalida tbody tr");
    const resumen = document.getElementById("resumenSalida");
    const totalBox = document.getElementById("montoTotalSalida");

    let totalCantidad = 0;
    let totalImporte = 0;

    filas.forEach(fila => {
        const cantidad = Number(fila.querySelector(".cantidad-salida-item")?.value || 0);
        totalCantidad += cantidad;
        totalImporte += calcularImporteFila(fila);
    });

    if (resumen) {
        resumen.innerHTML = `<strong>${filas.length}</strong> lote(s) · Cantidad total: <strong>${totalCantidad}</strong>`;
    }

	if (totalBox) {
	    totalBox.textContent = totalImporte.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
	    totalBox.classList.remove("anim-total");
	    void totalBox.offsetWidth;
	    totalBox.classList.add("anim-total");
	}
}

function actualizarFlujoSalidaVisual() {
    const almacenSelect = document.getElementById("almacenSalida");
    const localSelect = document.getElementById("localSalida");
    const tipoDestinoSelect = document.getElementById("tipoDestinoSalida");
    const almacenDestinoSelect = document.getElementById("almacenDestinoSalida");
    const flujoAlmacenNombre = document.getElementById("flujoAlmacenNombre");
    const flujoLocalNombre = document.getElementById("flujoLocalNombre");
    const estadoSalidaBox = document.getElementById("estadoSalidaBox");

    const nombreAlmacen = almacenSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione almacén";
    const tipoDestino = tipoDestinoSelect?.value || "LOCAL";
    const nombreDestino = tipoDestino === "LOCAL"
        ? (localSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione local")
        : (almacenDestinoSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione almacén destino");

    if (flujoAlmacenNombre) flujoAlmacenNombre.textContent = nombreAlmacen;
    if (flujoLocalNombre) flujoLocalNombre.textContent = nombreDestino;
    if (!estadoSalidaBox) return;

    const almacenValido = !!almacenSelect?.value;
    const destinoValido = tipoDestino === "LOCAL" ? !!localSelect?.value : !!almacenDestinoSelect?.value;

    if (almacenValido && destinoValido) {
        estadoSalidaBox.innerHTML = `<span class="badge text-bg-light border text-success"><i class="bi bi-arrow-left-right me-1"></i>Flujo configurado</span><span class="ms-2">Se enviará desde <strong>${escapeHtml(nombreAlmacen)}</strong> hacia <strong>${escapeHtml(nombreDestino)}</strong>.</span>`;
    } else if (almacenValido || destinoValido) {
        estadoSalidaBox.innerHTML = `<span class="badge text-bg-light border text-warning"><i class="bi bi-exclamation-circle me-1"></i>Flujo incompleto</span><span class="ms-2">Completa origen y destino para continuar.</span>`;
    } else {
        estadoSalidaBox.innerHTML = `<span class="text-muted">Selecciona el almacén de origen y el destino.</span>`;
    }
}

function mostrarCargandoSalida(titulo = "Procesando...") {
    Swal.fire({ title: titulo, text: "Por favor espera", allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
}
function cerrarCargandoSalida() { Swal.close(); }
function mostrarExitoSalida(mensaje = "Operación realizada correctamente") { Swal.fire({ title: "¡Buen trabajo!", text: mensaje, icon: "success", timer: 1800, showConfirmButton: false }); }
function mostrarErrorSalida(mensaje = "Ocurrió un error") { Swal.fire({ title: "Error", text: mensaje, icon: "error", confirmButtonText: "Entendido" }); }
function mostrarInfoSalida(mensaje = "Verifica la información") { Swal.fire({ title: "Atención", text: mensaje, icon: "warning", confirmButtonText: "Entendido" }); }

async function confirmarSwalSalida(titulo, texto, confirmText = "Sí, continuar") {
    const result = await Swal.fire({ title: titulo, text: texto, icon: "question", showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: "Volver", reverseButtons: true, focusCancel: true });
    return result.isConfirmed;
}
async function leerMensajeErrorSalida(response) { try { const text = await response.text(); return text || null; } catch { return null; } }
function escapeHtml(texto) { return String(texto || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function formatearNumero(num) { return Number(num).toLocaleString('es-PE', { maximumFractionDigits: 2 }); }

function calcularImporteFila(fila) {
    const cantidad = Number(fila.querySelector(".cantidad-salida-item")?.value || 0);
    const precioTexto = fila.querySelector(".precio-item")?.textContent || "0";
    const precio = Number(precioTexto.replace(/[^\d.-]/g, "") || 0);
    const importe = cantidad * precio;
    const celdaImporte = fila.querySelector(".subtotal-item");
    if (celdaImporte) celdaImporte.textContent = importe.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
    return importe;
}

async function cargarLocalAutomaticoPorAlmacenSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const select = document.getElementById("localSalida");
    if (!select) return;
    select.innerHTML = `<option value="">Seleccione local</option>`;
    if (!almacenId) return;

    try {
        const res = await fetch(`/api/locales/almacen/${almacenId}`);
        if (!res.ok) throw new Error("No se pudieron cargar los locales del almacén.");
        const data = await res.json();
        const localesActivos = (data || []).filter(l => l.activo !== false);
        localesActivos.forEach(local => select.innerHTML += `<option value="${local.id}">${escapeHtml(local.nombre)}</option>`);
        if (localesActivos.length === 1) select.value = String(localesActivos[0].id);
    } catch (error) {
        console.error(error);
        select.innerHTML = `<option value="">No disponible</option>`;
    }
}