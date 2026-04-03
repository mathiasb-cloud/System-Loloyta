let productosGlobal = [];
let ordenId = null;

const ORDEN_STORAGE_KEY = "loloyta_orden_borrador";

let modalAccionOrdenInstance = null;
let modalLoadingOrdenInstance = null;
let accionPendienteOrden = null;

async function initOrdenes() {
    await cargarAlmacenesOrden();
    configurarBuscador();
    restaurarBorradorLocal();
    renderizarEstadoOrden();
    actualizarResumenOrden();

    document.getElementById("almacenSelect")?.addEventListener("change", async function () {
        await cargarProductosPorAlmacenOrden();
        guardarBorradorLocal();
    });

    if (document.getElementById("almacenSelect")?.value) {
        await cargarProductosPorAlmacenOrden();
    }
}



async function cargarAlmacenesOrden() {
    try {
        console.log("Llamando API almacenes...");

        let res = await fetch("/api/almacenes/mis-almacenes", { credentials: "include" })

        console.log("Status:", res.status);

        let data = await res.json();

        console.log("Data recibida:", data);

        let select = document.getElementById("almacenSelect");

        console.log("Select encontrado:", select);

        if (!select) {
            console.error("No existe #almacenSelect en el DOM");
            return;
        }

        select.innerHTML = "";

        data.forEach(a => {
            console.log("Pintando:", a);

            select.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
        });

    } catch (error) {
        console.error("Error cargando almacenes:", error);
    }
}

async function cargarProductosPorAlmacenOrden() {
    const almacenId = document.getElementById("almacenSelect")?.value;

    productosGlobal = [];

    if (!almacenId) {
        return;
    }

    try {
        const res = await fetch(`/api/stock/almacen/${almacenId}`);
        if (!res.ok) throw new Error("No se pudieron cargar los productos del almacén.");

        const data = await res.json();

        productosGlobal = data
            .filter(s => s.producto && s.producto.activo !== false)
            .map(s => ({
                ...s.producto,
                proveedor: s.proveedor || null,
                stockActual: Number(s.cantidad || 0)
            }));
    } catch (error) {
        console.error(error);
        mostrarError(error.message || "No se pudieron cargar los productos del almacén.");
    }
}

function configurarBuscador() {
    const input = document.getElementById("buscador");
    const resultadosDiv = document.getElementById("resultados");

    if (!input || !resultadosDiv) return;

    input.addEventListener("input", function () {
		
		const almacenId = document.getElementById("almacenSelect")?.value;
		if (!almacenId) {
		    resultadosDiv.innerHTML = `
		        <div class="list-group-item text-muted small">
		            Selecciona un almacén para buscar productos.
		        </div>
		    `;
		    return;
		}
		
        const texto = this.value.toLowerCase().trim();
        resultadosDiv.innerHTML = "";

        if (!texto) return;

        const idsAgregados = obtenerProductosEnTabla().map(x => String(x.productoId));

        const filtrados = productosGlobal
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
		            </div>
		        </div>
		    `;

		    item.onclick = () => {
		        agregarProductoTabla(p);
		        document.getElementById("buscador").value = "";
		        resultadosDiv.innerHTML = "";
		        document.getElementById("buscador").blur();
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

function escapeHtml(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarExito(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarError(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfo(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

function agregarProductoTabla(producto) {
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;

    const yaExiste = [...tbody.querySelectorAll("tr")].some(tr => {
        const td = tr.querySelector("td[data-id]");
        return td && String(td.dataset.id) === String(producto.id);
    });

    if (yaExiste) {
        mostrarToastOrden("Ese producto ya está en la lista.", "warning");
        return;
    }

    const fila = document.createElement("tr");
    const precioInicial = Number(producto.precioActual || 0);

    fila.innerHTML = `
        <td data-id="${producto.id}">${escapeHtml(producto.nombre)}</td>
        <td>
            <input type="number" class="form-control cantidad-item" min="0.01" step="0.01" value="1">
        </td>
        <td>
            <input type="number" class="form-control precio-item" min="0" step="0.01" value="${precioInicial}">
        </td>
        <td>
            <select class="form-select metodo-pago-item">
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="YAPE">YAPE</option>
            </select>
        </td>
        <td class="importe-item text-end fw-semibold">S/ 0.00</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="eliminarFila(this)">X</button>
        </td>
    `;

    tbody.appendChild(fila);

    const cantidadInput = fila.querySelector(".cantidad-item");
    const precioInput = fila.querySelector(".precio-item");
    const metodoSelect = fila.querySelector(".metodo-pago-item");

    cantidadInput.addEventListener("input", () => {
        recalcularFila(fila);
        guardarBorradorLocal();
        actualizarResumenOrden();
    });

    precioInput.addEventListener("input", () => {
        recalcularFila(fila);
        guardarBorradorLocal();
        actualizarResumenOrden();
    });

    metodoSelect.addEventListener("change", () => {
        guardarBorradorLocal();
    });

    recalcularFila(fila);
    guardarBorradorLocal();
    actualizarResumenOrden();
    renderizarEstadoOrden();
}

function eliminarFila(btn) {
    btn.closest("tr").remove();
    guardarBorradorLocal();
    actualizarResumenOrden();
    renderizarEstadoOrden();
}

function recalcularFila(fila) {
    const cantidad = Number(fila.querySelector(".cantidad-item")?.value || 0);
    const precio = Number(fila.querySelector(".precio-item")?.value || 0);
    const importe = cantidad * precio;

    const celdaImporte = fila.querySelector(".importe-item");
    if (celdaImporte) {
        celdaImporte.textContent = formatearMoneda(importe);
    }
}

function obtenerProductosEnTabla() {
    const filas = document.querySelectorAll("#tablaProductos tbody tr");

    return [...filas].map(fila => {
        const productoId = fila.querySelector("td[data-id]")?.dataset.id;
        const productoNombre = fila.querySelector("td[data-id]")?.textContent?.trim() || "";
        const cantidad = fila.querySelector(".cantidad-item")?.value;
        const precioUnitario = fila.querySelector(".precio-item")?.value;
        const metodoPago = fila.querySelector(".metodo-pago-item")?.value;

        return {
            productoId,
            productoNombre,
            cantidad,
            precioUnitario,
            metodoPago
        };
    });
}

function validarOrden() {
    const almacenId = document.getElementById("almacenSelect")?.value;
    const items = obtenerProductosEnTabla();

    if (!almacenId) {
        mostrarInfo("Selecciona un almacén.");
        return false;
    }

    if (items.length === 0) {
        mostrarInfo("Agrega al menos un producto a la lista.");
        return false;
    }

    for (const item of items) {
        const cantidad = Number(item.cantidad);
        const precio = Number(item.precioUnitario);

        if (!item.productoId) {
            mostrarError("Hay un producto inválido en la lista.");
            return false;
        }

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            mostrarInfo(`La cantidad de "${item.productoNombre}" debe ser mayor a 0.`);
            return false;
        }

        if (!Number.isFinite(precio) || precio < 0) {
            mostrarInfo(`El precio de "${item.productoNombre}" no puede ser negativo.`);
            return false;
        }

        if (!item.metodoPago) {
            mostrarInfo(`Selecciona método de pago para "${item.productoNombre}".`);
            return false;
        }
    }

    return true;
}

async function guardarOrden() {
    try {
        if (!validarOrden()) return;

        mostrarCargando("Guardando orden...");

        if (!ordenId) {
            await crearCabeceraOrden();
        } else {
            await actualizarCabeceraOrden();
        }

        await sobrescribirDetallesOrden();

        cerrarCargando();
        mostrarExito("Orden guardada correctamente");

        guardarBorradorLocal();
        renderizarEstadoOrden();
        actualizarResumenOrden();

    } catch (error) {
        console.error(error);
        cerrarCargando();
        mostrarError(error.message || "No se pudo guardar la orden");
    }
}



async function confirmarOrden() {

    if (!validarOrden()) return;

    const ok = await confirmarSwal(
        "Confirmar orden",
        "El stock será actualizado y la orden quedará finalizada"
    );

    if (!ok) return;

    try {
        mostrarCargando("Confirmando orden...");

        if (!ordenId) {
            await crearCabeceraOrden();
        } else {
            await actualizarCabeceraOrden();
        }

        await sobrescribirDetallesOrden();

        const res = await fetch(`/api/ordenes-compra/${ordenId}/estado?estado=CONFIRMADA`, {
            method: "PATCH"
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg);
        }

        cerrarCargando();
        mostrarExito("Orden confirmada correctamente");

        limpiarOrdenUI();

    } catch (error) {
        console.error(error);
        cerrarCargando();
        mostrarError(error.message || "No se pudo confirmar la orden");
    }
}





async function ejecutarConfirmacionOrden() {
    try {
        bloquearBotones(true);
        mostrarLoadingOrden("Confirmando orden", "Actualizando stock y registrando movimiento...");

        if (!ordenId) {
            await crearCabeceraOrden();
        } else {
            await actualizarCabeceraOrden();
        }

        await sobrescribirDetallesOrden();

        const res = await fetch(`/api/ordenes-compra/${ordenId}/estado?estado=CONFIRMADA`, {
            method: "PATCH"
        });

        if (!res.ok) {
            const mensaje = await leerMensajeError(res);
            throw new Error(mensaje || "No se pudo confirmar la orden.");
        }

        ocultarLoadingOrdenConRetardo();
        limpiarOrdenUI();
        mostrarToastOrden("Orden confirmada correctamente.", "success");
    } catch (error) {
        console.error(error);
        ocultarLoadingOrden();
        mostrarToastOrden(error.message || "No se pudo confirmar la orden.", "danger");
    } finally {
        setTimeout(() => bloquearBotones(false), 350);
    }
}

async function ejecutarCancelacionOrden() {
    try {
        bloquearBotones(true);
        mostrarLoadingOrden("Cancelando orden", "Eliminando lista pendiente...");

        if (ordenId) {
            const res = await fetch(`/api/ordenes-compra/${ordenId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const mensaje = await leerMensajeError(res);
                throw new Error(mensaje || "No se pudo cancelar la orden.");
            }
        }

        ocultarLoadingOrdenConRetardo();
        limpiarOrdenUI();
        mostrarToastOrden("Orden cancelada correctamente.", "success");
    } catch (error) {
        console.error(error);
        ocultarLoadingOrden();
        mostrarToastOrden(error.message || "No se pudo cancelar la orden.", "danger");
    } finally {
        setTimeout(() => bloquearBotones(false), 350);
    }
}

async function crearCabeceraOrden() {
    const almacenId = document.getElementById("almacenSelect").value;

    const res = await fetch("/api/ordenes-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            estado: "PENDIENTE",
            almacenes: { id: Number(almacenId) },
            
        })
    });

    if (!res.ok) {
        throw new Error("No se pudo crear la orden.");
    }

    const data = await res.json();
    ordenId = data.id;
}

async function actualizarCabeceraOrden() {
    const almacenId = document.getElementById("almacenSelect").value;

    const res = await fetch(`/api/ordenes-compra/${ordenId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            almacenes: { id: Number(almacenId) },
            
        })
    });

    if (!res.ok) {
        const mensaje = await leerMensajeError(res);
        throw new Error(mensaje || "No se pudo actualizar la orden pendiente.");
    }
}

async function sobrescribirDetallesOrden() {
    const items = obtenerProductosEnTabla();

    const resDelete = await fetch(`/api/detalle-orden-compra/orden/${ordenId}`, {
        method: "DELETE"
    });

    if (!resDelete.ok) {
        const mensaje = await leerMensajeError(resDelete);
        console.error("Error eliminando detalles:", mensaje);
        throw new Error("No se pudieron limpiar los detalles anteriores.");
    }

    for (const item of items) {
        const res = await fetch("/api/detalle-orden-compra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ordenCompra: { id: ordenId },
                producto: { id: Number(item.productoId) },
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                metodoPago: item.metodoPago
            })
        });

        if (!res.ok) {
            const mensaje = await leerMensajeError(res);
            throw new Error(mensaje || `No se pudo guardar el detalle de ${item.productoNombre}.`);
        }
    }
}

function limpiarOrdenUI() {
    ordenId = null;

    const tbody = document.querySelector("#tablaProductos tbody");
    if (tbody) tbody.innerHTML = "";

    const buscador = document.getElementById("buscador");
    const resultados = document.getElementById("resultados");
    const almacenSelect = document.getElementById("almacenSelect");

    if (buscador) buscador.value = "";
    if (resultados) resultados.innerHTML = "";
    if (almacenSelect) almacenSelect.value = "";

    localStorage.removeItem(ORDEN_STORAGE_KEY);

    renderizarEstadoOrden();
    actualizarResumenOrden();
}

function guardarBorradorLocal() {
    const almacenId = document.getElementById("almacenSelect")?.value || "";
    const productos = obtenerProductosEnTabla();

    const payload = {
        ordenId,
        almacenId,
        productos
    };

    localStorage.setItem(ORDEN_STORAGE_KEY, JSON.stringify(payload));
}

function restaurarBorradorLocal() {
    try {
        const data = JSON.parse(localStorage.getItem(ORDEN_STORAGE_KEY));
        if (!data) return;

        ordenId = data.ordenId || null;

        const almacenSelect = document.getElementById("almacenSelect");
        if (almacenSelect && data.almacenId) {
            almacenSelect.value = String(data.almacenId);
        }

        const tbody = document.querySelector("#tablaProductos tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        (data.productos || []).forEach(item => {
            const producto = productosGlobal.find(p => String(p.id) === String(item.productoId));
            if (!producto) return;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td data-id="${producto.id}">${escapeHtml(producto.nombre)}</td>
                <td>
                    <input type="number" class="form-control cantidad-item" min="0.01" step="0.01" value="${item.cantidad}">
                </td>
                <td>
                    <input type="number" class="form-control precio-item" min="0" step="0.01" value="${item.precioUnitario}">
                </td>
                <td>
                    <select class="form-select metodo-pago-item">
                        <option value="EFECTIVO" ${item.metodoPago === "EFECTIVO" ? "selected" : ""}>EFECTIVO</option>
                        <option value="YAPE" ${item.metodoPago === "YAPE" ? "selected" : ""}>YAPE</option>
                    </select>
                </td>
                <td class="importe-item text-end fw-semibold">S/ 0.00</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarFila(this)">X</button>
                </td>
            `;

            tbody.appendChild(fila);

            const cantidadInput = fila.querySelector(".cantidad-item");
            const precioInput = fila.querySelector(".precio-item");
            const metodoSelect = fila.querySelector(".metodo-pago-item");

            cantidadInput.addEventListener("input", () => {
                recalcularFila(fila);
                guardarBorradorLocal();
                actualizarResumenOrden();
            });

            precioInput.addEventListener("input", () => {
                recalcularFila(fila);
                guardarBorradorLocal();
                actualizarResumenOrden();
            });

            metodoSelect.addEventListener("change", () => {
                guardarBorradorLocal();
            });

            recalcularFila(fila);
        });
    } catch (error) {
        console.error("No se pudo restaurar el borrador:", error);
        localStorage.removeItem(ORDEN_STORAGE_KEY);
    }
}

function actualizarResumenOrden() {
    const items = obtenerProductosEnTabla();
    const resumen = document.getElementById("resumenOrden");

    let total = 0;
    items.forEach(item => {
        total += Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
    });

    if (resumen) {
        resumen.innerHTML = `
            <strong>${items.length}</strong> producto(s) ·
            Total estimado: <strong>${formatearMoneda(total)}</strong>
        `;
    }
}

function renderizarEstadoOrden() {
    const box = document.getElementById("estadoOrdenBox");
    if (!box) return;

    const cantidadItems = obtenerProductosEnTabla().length;

    if (ordenId) {
        box.innerHTML = `
            <span class="badge text-bg-warning">PENDIENTE</span>
            <span class="ms-2">Orden en edición: <strong>#${ordenId}</strong></span>
            <span class="ms-2 text-muted">(${cantidadItems} item(s))</span>
        `;
    } else if (cantidadItems > 0) {
        box.innerHTML = `
            <span class="badge text-bg-secondary">BORRADOR LOCAL</span>
            <span class="ms-2">Lista cargada, aún no guardada en backend.</span>
        `;
    } else {
        box.innerHTML = `<span class="text-muted">Sin orden en edición.</span>`;
    }
}

function bloquearBotones(bloquear) {
    const ids = ["btnGuardarOrden", "btnConfirmarOrden", "btnCancelarOrden"];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = bloquear;
    });
}

async function leerMensajeError(response) {
    try {
        const text = await response.text();
        return text || null;
    } catch {
        return null;
    }
}








function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN"
    }).format(Number(valor || 0));
}

function escapeHtml(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarCargando(titulo = "Procesando...") {
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

function cerrarCargando() {
    Swal.close();
}

function mostrarExito(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        borderRadius: "15px"
    });
}

function mostrarError(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
        borderRadius: "15px"
    });
}

async function confirmarSwal(titulo, texto, confirmText = "Sí, continuar") {
    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        focusCancel: true,
        borderRadius: "15px"
    });

    return result.isConfirmed;
}

async function cancelarOrden() {

    const ok = await confirmarSwal(
        "Cancelar orden",
        "Se eliminará toda la lista actual. Esta acción no se puede deshacer",
        "Sí, cancelar"
    );

    if (!ok) return;

    try {
        mostrarCargando("Cancelando orden...");

        if (ordenId) {
            const res = await fetch(`/api/ordenes-compra/${ordenId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }
        }

        cerrarCargando();
        mostrarExito("Orden cancelada correctamente");

        limpiarOrdenUI();

    } catch (error) {
        console.error(error);
        cerrarCargando();
        mostrarError(error.message || "No se pudo cancelar");
    }
}

console.log("ordenes.js cargado");