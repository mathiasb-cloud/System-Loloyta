let salidaId = null;
let productosSalidaGlobal = [];

async function initSalidas() {
    await cargarAlmacenesSalida();

    document.getElementById("almacenSalida")?.addEventListener("change", async () => {
        await cargarProductosSalidaPorAlmacen();
        await cargarLocalAutomaticoPorAlmacenSalida();

        actualizarFlujoSalidaVisual();
        actualizarResumenSalida();

        const resultadosDiv = document.getElementById("resultadosSalida");
        const input = document.getElementById("buscadorSalida");

        if (resultadosDiv) resultadosDiv.innerHTML = "";
        if (input) input.value = "";
    });

    configurarBuscadorSalida();
    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
    actualizarResumenSalida();

    if (document.getElementById("almacenSalida")?.value) {
        await cargarProductosSalidaPorAlmacen();
        await cargarLocalAutomaticoPorAlmacenSalida();
    }
}

async function obtenerStockDisponibleSalida(productoId, almacenId) {
    if (!productoId || !almacenId) return 0;

    try {
        const res = await fetch(`/api/stock/buscar?productoId=${productoId}&almacenId=${almacenId}`);
        if (!res.ok) return 0;

        const data = await res.json();
        return Number(data?.cantidad || 0);
    } catch {
        return 0;
    }
}

function obtenerClaseStockSalida(stockActual, stockMinimo) {
    const stock = Number(stockActual || 0);
    const minimo = Number(stockMinimo || 0);

    return stock <= minimo ? "text-danger" : "text-success";
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
            resultadosDiv.innerHTML = `
                <div class="list-group-item text-muted small">
                    Selecciona un almacén para buscar productos.
                </div>
            `;
            return;
        }

        if (!texto) return;

        const idsAgregados = [...document.querySelectorAll("#tablaSalida tbody tr")]
            .map(fila => String(fila.dataset.id));

        const filtrados = productosSalidaGlobal
            .filter(p => p.nombre.toLowerCase().includes(texto))
            .filter(p => !idsAgregados.includes(String(p.id)))
            .slice(0, 8);

        if (filtrados.length === 0) {
            resultadosDiv.innerHTML = `
                <div class="list-group-item text-muted small">
                    No se encontraron productos.
                </div>
            `;
            return;
        }

        filtrados.forEach(p => {
            const stockActual = Number(p.stockActual || 0);
            const stockMinimo = Number(p.stockMinimo || 0);
            const claseStock = stockActual <= stockMinimo ? "text-danger" : "text-success";

            const item = document.createElement("button");
            item.type = "button";
            item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";

            item.innerHTML = `
                <div class="text-start">
                    <div class="fw-medium">${escapeHtml(p.nombre)}</div>
                    <small class="text-muted d-block">${escapeHtml(p.categoria?.nombre || "")}</small>
                </div>

                <div class="d-flex align-items-center gap-3 bloque-derecha">
                    <div class="precio-item">
                        <span class="label-precio">Precio:</span>
                        <span class="valor-precio">
                            ${Number(p.precioActual || 0).toLocaleString('es-PE', {
                                style: 'currency',
                                currency: 'PEN'
                            })}
                        </span>
                    </div>

                    <div class="text-end">
                        <small class="text-muted d-block">${escapeHtml(p.unidadMedida || "")}</small>
                        <small class="${claseStock} fw-semibold d-block">
                            Stock: ${stockActual}
                        </small>
                    </div>
                </div>
            `;

            item.onclick = () => {
                agregarProductoSalida(p);

                input.value = "";
                resultadosDiv.innerHTML = "";
                input.blur();

                actualizarResumenSalida();
            };

            resultadosDiv.appendChild(item);
        });
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            resultadosDiv.innerHTML = "";
        }
    });

    document.addEventListener("click", function (e) {
        if (!resultadosDiv.contains(e.target) && e.target !== input) {
            resultadosDiv.innerHTML = "";
        }
    });
}


async function cargarAlmacenesSalida() {
    const res = await fetch('/api/almacenes');
    const data = await res.json();

    const select = document.getElementById("almacenSalida");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione almacén</option>`;

    data.forEach(a => {
        select.innerHTML += `<option value="${a.id}">${escapeHtml(a.nombre)}</option>`;
    });
}

async function cargarLocalesSalida() {
    const res = await fetch('/api/locales');
    const data = await res.json();

    const select = document.getElementById("localSalida");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione un local</option>`;

    data.forEach(local => {
        select.innerHTML += `<option value="${local.id}">${escapeHtml(local.nombre)}</option>`;
    });
}


async function cargarProductosSalidaPorAlmacen() {
    const almacenId = document.getElementById("almacenSalida")?.value;

    productosSalidaGlobal = [];

    if (!almacenId) return;

    try {
        const res = await fetch(`/api/stock/almacen/${almacenId}`);
        if (!res.ok) {
            throw new Error("No se pudieron cargar los productos del almacén.");
        }

        const data = await res.json();

        productosSalidaGlobal = data
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
function agregarProductoSalida(producto) {
    const tbody = document.querySelector("#tablaSalida tbody");
    if (!tbody) return;

    const yaExiste = [...tbody.querySelectorAll("tr")].some(tr => String(tr.dataset.id) === String(producto.id));
    if (yaExiste) return;

    const fila = document.createElement("tr");
    fila.dataset.id = producto.id;

    fila.innerHTML = `
        <td>${escapeHtml(producto.categoria?.nombre || "-")}</td>
        <td>${escapeHtml(producto.nombre || "-")}</td>
        <td>${escapeHtml(producto.unidadMedida || "-")}</td>
        <td>
            <input type="number" class="form-control cantidad-salida-item" value="1" min="1" step="1">
        </td>
        <td class="precio-item">${Number(producto.precioActual || 0).toFixed(2)}</td>
        <td class="subtotal-item fw-semibold text-center">S/ 0.00</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="eliminarFilaSalida(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(fila);

    fila.querySelector(".cantidad-salida-item")?.addEventListener("input", () => {
        recalcularFilaSalida(fila);
        actualizarResumenSalida();
    });

    recalcularFilaSalida(fila);
}
function eliminarFilaSalida(btn) {
    btn.closest("tr").remove();
    actualizarResumenSalida();
}

function obtenerItemsSalida() {
    const filas = document.querySelectorAll("#tablaSalida tbody tr");

    return [...filas].map(fila => {
        const cantidadInput = fila.querySelector(".cantidad-salida-item");

        return {
            productoId: Number(fila.dataset.id),
            cantidadDespacho: Number(cantidadInput?.value || 0)
        };
    });
}

function validarSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const localId = document.getElementById("localSalida")?.value;
    const filas = document.querySelectorAll("#tablaSalida tbody tr");

    if (!almacenId) {
        mostrarInfoSalida("Seleccione un almacén.");
        return false;
    }

    if (!localId) {
        mostrarInfoSalida("Seleccione un local destino.");
        return false;
    }

    if (filas.length === 0) {
        mostrarInfoSalida("Agregue al menos un producto a la salida.");
        return false;
    }

    for (const fila of filas) {
        const nombre = fila.children[1]?.textContent?.trim() || "producto";
        const cantidad = Number(fila.querySelector(".cantidad-salida-item")?.value || 0);

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            mostrarInfoSalida(`La cantidad de despacho para "${nombre}" debe ser mayor a cero.`);
            return false;
        }
    }

    return true;
}

async function guardarOSobrescribirSalida() {
    if (!validarSalida()) return;

    try {
        mostrarCargandoSalida(salidaId ? "Guardando cambios..." : "Guardando salida...");

        if (!salidaId) {
            await crearSalida();
        } else {
            await guardarCambiosSalida();
        }

        cerrarCargandoSalida();
        mostrarExitoSalida(salidaId ? "Cambios guardados correctamente." : "Salida guardada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida(error.message || "No se pudo guardar la salida.");
    }
}

async function crearSalida() {
    const almacenId = document.getElementById("almacenSalida").value;
    const localId = document.getElementById("localSalida").value;

    const res = await fetch('/api/salidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            almacenes: { id: Number(almacenId) },
            locales: { id: Number(localId) },
            usuario: { id: 1 }
        })
    });

    if (!res.ok) {
        const msg = await leerMensajeErrorSalida(res);
        throw new Error(msg || "No se pudo crear la salida.");
    }

    const data = await res.json();
    salidaId = data.id;

    if (!salidaId) {
        throw new Error("No se pudo obtener el ID de la salida.");
    }

    try {
        await guardarDetalleSalida();
    } catch (error) {
        await fetch(`/api/salidas/${salidaId}`, { method: 'DELETE' });
        salidaId = null;
        throw error;
    }

    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
}

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
                cantidadDespacho: cantidad
            })
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorSalida(res);
            throw new Error(msg || "No se pudo guardar un detalle de la salida.");
        }
    }
}

async function guardarCambiosSalida() {
    const almacenId = document.getElementById("almacenSalida").value;
    const localId = document.getElementById("localSalida").value;

    const resSalida = await fetch(`/api/salidas/${salidaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            almacenes: { id: Number(almacenId) },
            locales: { id: Number(localId) },
            usuario: { id: 1 }
        })
    });

    if (!resSalida.ok) {
        const msg = await leerMensajeErrorSalida(resSalida);
        throw new Error(msg || "No se pudo actualizar la salida.");
    }

    const resBorrarDetalle = await fetch(`/api/detalle-salida/salida/${salidaId}`, {
        method: 'DELETE'
    });

    if (!resBorrarDetalle.ok) {
        const msg = await leerMensajeErrorSalida(resBorrarDetalle);
        throw new Error(msg || "No se pudo actualizar el detalle de la salida.");
    }

    await guardarDetalleSalida();
    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
}

async function confirmarSalida() {
    if (!salidaId) {
        mostrarInfoSalida("Primero guarda la salida.");
        return;
    }

    const ok = await confirmarSwalSalida(
        "Confirmar salida",
        "Se descontará el stock del almacén y se registrará el movimiento.",
        "Sí, confirmar"
    );

    if (!ok) return;

    try {
        mostrarCargandoSalida("Confirmando salida...");

        const res = await fetch(`/api/salidas/${salidaId}/confirmar`, {
            method: 'PATCH'
        });

        if (!res.ok) {
            const mensaje = await leerMensajeErrorSalida(res);
            throw new Error(mensaje || "No se pudo confirmar la salida.");
        }

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
    if (!salidaId) {
        mostrarInfoSalida("No hay salida pendiente para cancelar.");
        return;
    }

    const ok = await confirmarSwalSalida(
        "Cancelar salida",
        "Se eliminará la salida pendiente y toda la lista actual.",
        "Sí, cancelar"
    );

    if (!ok) return;

    try {
        mostrarCargandoSalida("Cancelando salida...");

        const res = await fetch(`/api/salidas/${salidaId}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorSalida(res);
            throw new Error(msg || "No se pudo cancelar la salida.");
        }

        limpiarFormularioSalida();
        cerrarCargandoSalida();
        mostrarExitoSalida("Salida pendiente cancelada.");
    } catch (error) {
        console.error(error);
        cerrarCargandoSalida();
        mostrarErrorSalida(error.message || "No se pudo cancelar la salida.");
    }
}

function limpiarFormularioSalida() {
    salidaId = null;

    const tbody = document.querySelector("#tablaSalida tbody");
    if (tbody) {
        tbody.innerHTML = "";
    }

    const buscador = document.getElementById("buscadorSalida");
    if (buscador) {
        buscador.value = "";
    }

    const resultados = document.getElementById("resultadosSalida");
    if (resultados) {
        resultados.innerHTML = "";
    }

    const almacenSelect = document.getElementById("almacenSalida");
    if (almacenSelect) {
        almacenSelect.value = "";
    }

    const localSelect = document.getElementById("localSalida");
    if (localSelect) {
        localSelect.value = "";
    }

    actualizarEstadoBotonesSalida();
    actualizarFlujoSalidaVisual();
    actualizarResumenSalida();
}

function actualizarEstadoBotonesSalida() {
    const textoGuardar = document.getElementById("textoBtnGuardarSalida");
    const btnConfirmar = document.getElementById("btnConfirmarSalida");
    const btnCancelar = document.getElementById("btnCancelarSalida");

    const yaGuardada = !!salidaId;

    if (textoGuardar) {
        textoGuardar.textContent = yaGuardada ? "Guardar cambios" : "Guardar Salida";
    }

    if (btnConfirmar) {
        btnConfirmar.disabled = !yaGuardada;
    }

    if (btnCancelar) {
        btnCancelar.disabled = !yaGuardada;
    }
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
        resumen.innerHTML = `
            <strong>${filas.length}</strong> producto(s) · 
            Cantidad total: <strong>${totalCantidad}</strong>
        `;
    }

    

	if (totalBox) {
	    totalBox.textContent = totalImporte.toLocaleString('es-PE', {
	        style: 'currency',
	        currency: 'PEN'
	    });

	    
	    totalBox.classList.remove("anim-total");
	    void totalBox.offsetWidth;
	    totalBox.classList.add("anim-total");
	}
}

function actualizarFlujoSalidaVisual() {
    const almacenSelect = document.getElementById("almacenSalida");
    const localSelect = document.getElementById("localSalida");

    const flujoAlmacenNombre = document.getElementById("flujoAlmacenNombre");
    const flujoLocalNombre = document.getElementById("flujoLocalNombre");
    const estadoSalidaBox = document.getElementById("estadoSalidaBox");

    const nombreAlmacen = almacenSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione almacén";
    const nombreLocal = localSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione local";

    if (flujoAlmacenNombre) {
        flujoAlmacenNombre.textContent = nombreAlmacen;
    }

    if (flujoLocalNombre) {
        flujoLocalNombre.textContent = nombreLocal;
    }

    if (estadoSalidaBox) {
        const almacenValido = almacenSelect?.value;
        const localValido = localSelect?.value;

        if (almacenValido && localValido) {
            estadoSalidaBox.innerHTML = `
                <span class="badge text-bg-light border text-success">
                    <i class="bi bi-arrow-left-right me-1"></i>
                    Flujo configurado
                </span>
                <span class="ms-2">Se enviará desde <strong>${escapeHtml(nombreAlmacen)}</strong> hacia <strong>${escapeHtml(nombreLocal)}</strong>.</span>
            `;
        } else if (almacenValido || localValido) {
            estadoSalidaBox.innerHTML = `
                <span class="badge text-bg-light border text-warning">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Flujo incompleto
                </span>
                <span class="ms-2">Completa origen y destino para continuar.</span>
            `;
        } else {
            estadoSalidaBox.innerHTML = `
                <span class="text-muted">Selecciona el almacén de origen y el local de destino.</span>
            `;
        }
    }
}

function mostrarCargandoSalida(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function cerrarCargandoSalida() {
    Swal.close();
}

function mostrarExitoSalida(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarErrorSalida(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoSalida(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

async function confirmarSwalSalida(titulo, texto, confirmText = "Sí, continuar") {
    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Volver",
        reverseButtons: true,
        focusCancel: true
    });

    return result.isConfirmed;
}

async function leerMensajeErrorSalida(response) {
    try {
        const text = await response.text();
        return text || null;
    } catch {
        return null;
    }
}

function escapeHtml(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function calcularImporteFila(fila) {
    const cantidad = Number(fila.querySelector(".cantidad-salida-item")?.value || 0);

    const precioTexto = fila.querySelector(".precio-item")?.textContent || "0";
    const precio = Number(precioTexto.replace(/[^\d.-]/g, "") || 0);

    const importe = cantidad * precio;

    const celdaImporte = fila.querySelector(".importe-item");

    if (celdaImporte) {
        celdaImporte.textContent = importe.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });
    }

    return importe;
}



async function cargarLocalesPorAlmacenSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const select = document.getElementById("localSalida");

    if (!select) return;

    select.innerHTML = `<option value="">Seleccione local</option>`;

    if (!almacenId) return;

    try {
        const res = await fetch(`/api/locales/almacen/${almacenId}`);
        if (!res.ok) throw new Error("No se pudieron cargar los locales del almacén");

        const data = await res.json();

        data
            .filter(l => l.activo !== false)
            .forEach(l => {
                select.innerHTML += `<option value="${l.id}">${l.nombre}</option>`;
            });
    } catch (error) {
        console.error(error);
    }
}

async function cargarLocalAutomaticoPorAlmacenSalida() {
    const almacenId = document.getElementById("almacenSalida")?.value;
    const select = document.getElementById("localSalida");

    if (!select) return;

    select.innerHTML = `<option value="">Seleccione local</option>`;

    if (!almacenId) return;

    try {
        const res = await fetch(`/api/locales/almacen/${almacenId}`);
        if (!res.ok) {
            throw new Error("No se pudo cargar el local del almacén.");
        }

        const data = await res.json();

        const localesActivos = (data || []).filter(l => l.activo !== false);

        if (localesActivos.length > 0) {
            const local = localesActivos[0];
            select.innerHTML = `<option value="${local.id}">${local.nombre}</option>`;
            select.value = String(local.id);
        } else {
            select.innerHTML = `<option value="">Sin local asociado</option>`;
        }
    } catch (error) {
        console.error(error);
        select.innerHTML = `<option value="">No disponible</option>`;
    }
}



