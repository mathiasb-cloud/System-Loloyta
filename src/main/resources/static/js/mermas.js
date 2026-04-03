let productosMermaGlobal = [];
let mermaId = null;

const MERMA_STORAGE_KEY = "loloyta_merma_borrador";

async function initMermas() {
    await cargarAlmacenesMerma();
    await cargarMotivosMerma();
    setFechaActualMerma();
    configurarBuscadorMerma();
    restaurarBorradorMermaLocal();
    enlazarEventosMerma();
    actualizarFlujoMermaVisual();
    actualizarResumenMerma();

	document.getElementById("almacenMerma")?.addEventListener("change", async () => {
	    await cargarProductosMermaPorAlmacen();
	    await refrescarStocksTablaMerma();

	    const input = document.getElementById("buscadorMerma");
	    const resultados = document.getElementById("resultadosMerma");

	    if (input) input.value = "";
	    if (resultados) resultados.innerHTML = "";

	    guardarBorradorMermaLocal();
	    actualizarFlujoMermaVisual();
	    actualizarResumenMerma();
	});

    if (document.getElementById("almacenMerma")?.value) {
        await cargarProductosMermaPorAlmacen();
    }
}

function enlazarEventosMerma() {
    document.getElementById("almacenMerma")?.addEventListener("change", async () => {
        await refrescarStocksTablaMerma();
        guardarBorradorMermaLocal();
        actualizarFlujoMermaVisual();
        actualizarResumenMerma();
    });

    document.getElementById("motivoMerma")?.addEventListener("change", () => {
        guardarBorradorMermaLocal();
        actualizarFlujoMermaVisual();
    });

    document.getElementById("fechaMerma")?.addEventListener("change", () => {
        guardarBorradorMermaLocal();
    });

    document.getElementById("observacionMerma")?.addEventListener("input", () => {
        guardarBorradorMermaLocal();
    });
}

function setFechaActualMerma() {
    const input = document.getElementById("fechaMerma");
    if (!input || input.value) return;

    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd = String(ahora.getDate()).padStart(2, "0");
    const hh = String(ahora.getHours()).padStart(2, "0");
    const mi = String(ahora.getMinutes()).padStart(2, "0");

    input.value = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

async function cargarAlmacenesMerma() {
    try {
        const res = await fetch("/api/almacenes/mis-almacenes", { credentials: "include" })
        console.log("Respuesta almacenes:", res.status);

        const data = await res.json();
        console.log("Data almacenes:", data);

        const select = document.getElementById("almacenMerma");
        console.log("Select encontrado:", select);

        if (!select) return;

        select.innerHTML = `<option value="">Seleccione almacén</option>`;

        data
            .filter(a => a.activo !== false)
            .forEach(a => {
                select.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
            });

    } catch (error) {
        console.error("Error cargando almacenes en merma:", error);
    }
}

async function cargarMotivosMerma() {
    const select = document.getElementById("motivoMerma");
    if (!select) return;

    try {
        const res = await fetch("/api/motivos-merma");
        const data = await res.json();

        select.innerHTML = `<option value="">Seleccione motivo</option>`;

        (data || []).forEach(m => {
            select.innerHTML += `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`;
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = `<option value="">No se pudieron cargar los motivos</option>`;
    }
}



async function cargarProductosMermaPorAlmacen() {
    const almacenId = document.getElementById("almacenMerma")?.value;

    productosMermaGlobal = [];

    if (!almacenId) return;

    try {
        const res = await fetch(`/api/stock/almacen/${almacenId}`);
        if (!res.ok) {
            throw new Error("No se pudieron cargar los productos del almacén.");
        }

        const data = await res.json();

        productosMermaGlobal = data
            .filter(s => s.producto && s.producto.activo !== false)
            .map(s => ({
                ...s.producto,
                proveedor: s.proveedor || null,
                stockActual: Number(s.cantidad || 0)
            }));
    } catch (error) {
        console.error(error);
        mostrarErrorMerma(error.message || "No se pudieron cargar los productos del almacén.");
    }
}


function configurarBuscadorMerma() {
    const input = document.getElementById("buscadorMerma");
    const resultadosDiv = document.getElementById("resultadosMerma");

    if (!input || !resultadosDiv) return;

    input.addEventListener("input", function () {
        const texto = this.value.toLowerCase().trim();
        resultadosDiv.innerHTML = "";

        const almacenId = document.getElementById("almacenMerma")?.value;

        if (!almacenId) {
            resultadosDiv.innerHTML = `
                <div class="list-group-item text-muted small">
                    Selecciona un almacén para buscar productos.
                </div>
            `;
            return;
        }

        if (!texto) return;

        const idsAgregados = [...document.querySelectorAll("#tablaMerma tbody tr")]
            .map(fila => String(fila.dataset.id));

        const filtrados = productosMermaGlobal
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

			item.onclick = async () => {
			    await agregarProductoTablaMerma(p);

			    input.value = "";
			    resultadosDiv.innerHTML = "";
			    input.blur();

			    actualizarResumenMerma();
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

async function obtenerStockDisponible(productoId, almacenId) {
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

async function agregarProductoTablaMerma(producto, cantidad = 1) {
    const tbody = document.querySelector("#tablaMerma tbody");
    if (!tbody) return;

    const yaExiste = [...tbody.querySelectorAll("tr")].some(tr => {
        const td = tr.querySelector("td[data-id]");
        return td && String(td.dataset.id) === String(producto.id);
    });

    if (yaExiste) {
        mostrarInfoMerma("Ese producto ya está en la lista.");
        return;
    }

    const almacenId = document.getElementById("almacenMerma")?.value || "";
    const stockActual = await obtenerStockDisponible(producto.id, almacenId);

    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-id="${producto.id}" data-precio="${Number(producto.precioActual || 0)}">${escapeHtml(producto.nombre)}</td>
        <td>${escapeHtml(producto.categoria?.nombre || "-")}</td>
        <td>${escapeHtml(producto.unidadMedida || "-")}</td>
        <td class="stock-actual-cell">${renderStockChip(stockActual, producto.stockMinimo)}</td>
        <td>
            <input type="number" class="form-control cantidad-merma-item" min="0.01" step="0.01" value="${cantidad}">
        </td>
        <td class="text-end costo-unitario-cell">${formatearMoneda(producto.precioActual || 0)}</td>
        <td class="text-end merma-loss-cell perdida-merma-cell">${formatearMoneda((producto.precioActual || 0) * cantidad)}</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="eliminarFilaMerma(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(fila);

    const cantidadInput = fila.querySelector(".cantidad-merma-item");
    cantidadInput.addEventListener("input", () => {
        validarCantidadFilaMerma(fila);
        recalcularFilaMerma(fila);
        guardarBorradorMermaLocal();
        actualizarResumenMerma();
        actualizarFlujoMermaVisual();
    });

    validarCantidadFilaMerma(fila);
    recalcularFilaMerma(fila);
    guardarBorradorMermaLocal();
    actualizarResumenMerma();
    actualizarFlujoMermaVisual();
}

function renderStockChip(stockActual, stockMinimo) {
    const stock = Number(stockActual || 0);
    const minimo = Number(stockMinimo || 0);

    let clase = "stock-chip-ok";
    if (stock <= 0) clase = "stock-chip-zero";
    else if (stock <= minimo) clase = "stock-chip-low";

    return `
        <span class="stock-chip ${clase}">
            <i class="bi bi-box"></i>
            ${formatearNumero(stock)}
        </span>
    `;
}

function validarCantidadFilaMerma(fila) {
    const input = fila.querySelector(".cantidad-merma-item");
    const stockCell = fila.querySelector(".stock-actual-cell");

    const textoStock = stockCell?.textContent?.replace(",", ".").match(/[\d.]+/)?.[0];
    const stockActual = Number(textoStock || 0);
    const cantidad = Number(input?.value || 0);

    input.classList.remove("is-invalid");

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        input.classList.add("is-invalid");
        return false;
    }

    if (cantidad > stockActual) {
        input.classList.add("is-invalid");
        return false;
    }

    return true;
}

function recalcularFilaMerma(fila) {
    const precio = Number(fila.querySelector("td[data-id]")?.dataset.precio || 0);
    const cantidad = Number(fila.querySelector(".cantidad-merma-item")?.value || 0);
    const perdida = precio * cantidad;

    const perdidaCell = fila.querySelector(".perdida-merma-cell");
    if (perdidaCell) {
        perdidaCell.textContent = formatearMoneda(perdida);
    }
}

function eliminarFilaMerma(btn) {
    btn.closest("tr").remove();
    guardarBorradorMermaLocal();
    actualizarResumenMerma();
    actualizarFlujoMermaVisual();
}

function obtenerItemsMermaTabla() {
    const filas = document.querySelectorAll("#tablaMerma tbody tr");

    return [...filas].map(fila => {
        const productoTd = fila.querySelector("td[data-id]");
        const cantidadInput = fila.querySelector(".cantidad-merma-item");
        const stockTexto = fila.querySelector(".stock-actual-cell")?.textContent?.replace(",", ".").match(/[\d.]+/)?.[0];

        return {
            productoId: productoTd?.dataset.id,
            productoNombre: productoTd?.textContent?.trim() || "",
            precioActual: Number(productoTd?.dataset.precio || 0),
            cantidad: cantidadInput?.value,
            stockActual: Number(stockTexto || 0)
        };
    });
}

function validarMerma() {
    const almacenId = document.getElementById("almacenMerma")?.value;
    const motivoId = document.getElementById("motivoMerma")?.value;
    const fecha = document.getElementById("fechaMerma")?.value;
    const items = obtenerItemsMermaTabla();

    if (!almacenId) {
        mostrarInfoMerma("Selecciona un almacén.");
        return false;
    }

    if (!motivoId) {
        mostrarInfoMerma("Selecciona un motivo de merma.");
        return false;
    }

    if (!fecha) {
        mostrarInfoMerma("Selecciona la fecha de la merma.");
        return false;
    }

    if (items.length === 0) {
        mostrarInfoMerma("Agrega al menos un producto a la merma.");
        return false;
    }

    for (const item of items) {
        const cantidad = Number(item.cantidad);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            mostrarInfoMerma(`La cantidad de "${item.productoNombre}" debe ser mayor a cero.`);
            return false;
        }

        if (cantidad > Number(item.stockActual || 0)) {
            mostrarErrorMerma(`La cantidad de "${item.productoNombre}" supera el stock disponible.`);
            return false;
        }
    }

    return true;
}

async function guardarMerma() {
    try {
        if (!validarMerma()) return;

        mostrarCargandoMerma("Guardando merma...");

        if (!mermaId) {
            await crearCabeceraMerma();
        } else {
            await actualizarCabeceraMerma();
        }

        await sobrescribirDetallesMerma();

        guardarBorradorMermaLocal();
        actualizarFlujoMermaVisual();
        actualizarResumenMerma();

        cerrarCargandoMerma();
        mostrarExitoMerma("Merma guardada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoMerma();
        mostrarErrorMerma(error.message || "No se pudo guardar la merma.");
    }
}

async function confirmarMerma() {
    if (!validarMerma()) return;

    const totalPerdida = calcularPerdidaTotalMerma();
    const ok = await confirmarSwalMerma(
        "Confirmar merma",
        `Se descontará stock y se registrará una pérdida estimada de ${formatearMoneda(totalPerdida)}.`
    );

    if (!ok) return;

    try {
        mostrarCargandoMerma("Confirmando merma...");

        if (!mermaId) {
            await crearCabeceraMerma();
        } else {
            await actualizarCabeceraMerma();
        }

        await sobrescribirDetallesMerma();

        const res = await fetch(`/api/mermas/${mermaId}/confirmar`, {
            method: "PATCH"
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorMerma(res);
            throw new Error(msg || "No se pudo confirmar la merma.");
        }

        limpiarMermaUI();
        cerrarCargandoMerma();
        mostrarExitoMerma("Merma confirmada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoMerma();
        mostrarErrorMerma(error.message || "No se pudo confirmar la merma.");
    }
}

async function cancelarMerma() {
    const items = obtenerItemsMermaTabla();

    if (!mermaId && items.length === 0) {
        mostrarInfoMerma("No hay una merma en edición para cancelar.");
        return;
    }

    const ok = await confirmarSwalMerma(
        "Cancelar merma",
        "Se eliminará la merma pendiente y toda la lista actual."
    );

    if (!ok) return;

    try {
        mostrarCargandoMerma("Cancelando merma...");

        if (mermaId) {
            const res = await fetch(`/api/mermas/${mermaId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const msg = await leerMensajeErrorMerma(res);
                throw new Error(msg || "No se pudo cancelar la merma.");
            }
        }

        limpiarMermaUI();
        cerrarCargandoMerma();
        mostrarExitoMerma("Merma cancelada correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoMerma();
        mostrarErrorMerma(error.message || "No se pudo cancelar la merma.");
    }
}

async function crearCabeceraMerma() {
    const res = await fetch("/api/mermas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            almacen: { id: Number(document.getElementById("almacenMerma").value) },
            motivo: { id: Number(document.getElementById("motivoMerma").value) },
            observacion: document.getElementById("observacionMerma").value?.trim() || "",
            fecha: document.getElementById("fechaMerma").value,
            
        })
    });

    if (!res.ok) {
        const msg = await leerMensajeErrorMerma(res);
        throw new Error(msg || "No se pudo crear la merma.");
    }

    const data = await res.json();
    mermaId = data.id;
}

async function actualizarCabeceraMerma() {
    const res = await fetch(`/api/mermas/${mermaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            almacen: { id: Number(document.getElementById("almacenMerma").value) },
            motivo: { id: Number(document.getElementById("motivoMerma").value) },
            observacion: document.getElementById("observacionMerma").value?.trim() || "",
            fecha: document.getElementById("fechaMerma").value,
            
        })
    });

    if (!res.ok) {
        const msg = await leerMensajeErrorMerma(res);
        throw new Error(msg || "No se pudo actualizar la merma.");
    }
}

async function sobrescribirDetallesMerma() {
    const items = obtenerItemsMermaTabla();

    const resDelete = await fetch(`/api/detalle-merma/merma/${mermaId}`, {
        method: "DELETE"
    });

    if (!resDelete.ok) {
        const msg = await leerMensajeErrorMerma(resDelete);
        throw new Error(msg || "No se pudieron limpiar los detalles anteriores.");
    }

    for (const item of items) {
        const res = await fetch("/api/detalle-merma", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merma: { id: mermaId },
                producto: { id: Number(item.productoId) },
                cantidad: item.cantidad
            })
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorMerma(res);
            throw new Error(msg || `No se pudo guardar el detalle de ${item.productoNombre}.`);
        }
    }
}

async function refrescarStocksTablaMerma() {
    const filas = document.querySelectorAll("#tablaMerma tbody tr");
    const almacenId = document.getElementById("almacenMerma")?.value || "";

    for (const fila of filas) {
        const productoId = fila.querySelector("td[data-id]")?.dataset.id;
        const producto = productosMermaGlobal.find(p => String(p.id) === String(productoId));

        const stockActual = await obtenerStockDisponible(productoId, almacenId);
        const stockCell = fila.querySelector(".stock-actual-cell");

        if (stockCell) {
            stockCell.innerHTML = renderStockChip(stockActual, producto?.stockMinimo);
        }

        validarCantidadFilaMerma(fila);
    }
}

function guardarBorradorMermaLocal() {
    const payload = {
        mermaId,
        almacenId: document.getElementById("almacenMerma")?.value || "",
        motivoId: document.getElementById("motivoMerma")?.value || "",
        fecha: document.getElementById("fechaMerma")?.value || "",
        observacion: document.getElementById("observacionMerma")?.value || "",
        items: obtenerItemsMermaTabla()
    };

    localStorage.setItem(MERMA_STORAGE_KEY, JSON.stringify(payload));
}

async function restaurarBorradorMermaLocal() {
    try {
        const data = JSON.parse(localStorage.getItem(MERMA_STORAGE_KEY));
        if (!data) return;

        mermaId = data.mermaId || null;

        const almacen = document.getElementById("almacenMerma");
        const motivo = document.getElementById("motivoMerma");
        const fecha = document.getElementById("fechaMerma");
        const observacion = document.getElementById("observacionMerma");

        if (almacen && data.almacenId) almacen.value = String(data.almacenId);
        if (motivo && data.motivoId) motivo.value = String(data.motivoId);
        if (fecha && data.fecha) fecha.value = data.fecha;
        if (observacion) observacion.value = data.observacion || "";

        if (data.almacenId) {
            await cargarProductosMermaPorAlmacen();
        }

        for (const item of (data.items || [])) {
            const producto = productosMermaGlobal.find(p => String(p.id) === String(item.productoId));
            if (!producto) continue;

            await agregarProductoTablaMerma(producto, item.cantidad);
        }

        actualizarFlujoMermaVisual();
        actualizarResumenMerma();
    } catch (error) {
        console.error("No se pudo restaurar borrador de merma:", error);
        localStorage.removeItem(MERMA_STORAGE_KEY);
    }
}

function limpiarMermaUI() {
    mermaId = null;

    const tbody = document.querySelector("#tablaMerma tbody");
    if (tbody) tbody.innerHTML = "";

    const buscador = document.getElementById("buscadorMerma");
    const resultados = document.getElementById("resultadosMerma");
    const almacen = document.getElementById("almacenMerma");
    const motivo = document.getElementById("motivoMerma");
    const observacion = document.getElementById("observacionMerma");
    const fecha = document.getElementById("fechaMerma");

    if (buscador) buscador.value = "";
    if (resultados) resultados.innerHTML = "";
    if (almacen) almacen.value = "";
    if (motivo) motivo.value = "";
    if (observacion) observacion.value = "";
    if (fecha) fecha.value = "";

    setFechaActualMerma();
    localStorage.removeItem(MERMA_STORAGE_KEY);

    actualizarFlujoMermaVisual();
    actualizarResumenMerma();
}

function actualizarFlujoMermaVisual() {
    const almacenSelect = document.getElementById("almacenMerma");
    const motivoSelect = document.getElementById("motivoMerma");
    const estadoBox = document.getElementById("estadoMermaBox");

    const nombreAlmacen = almacenSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione almacén";
    const nombreMotivo = motivoSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione motivo";

    const visualAlmacen = document.getElementById("mermaAlmacenVisual");
    const visualMotivo = document.getElementById("mermaMotivoVisual");
    const visualPerdida = document.getElementById("mermaPerdidaVisual");

    if (visualAlmacen) visualAlmacen.textContent = nombreAlmacen;
    if (visualMotivo) visualMotivo.textContent = nombreMotivo;
    if (visualPerdida) visualPerdida.textContent = formatearMoneda(calcularPerdidaTotalMerma());

    const items = obtenerItemsMermaTabla().length;

    if (mermaId) {
        estadoBox.innerHTML = `
            <span class="badge text-bg-warning">PENDIENTE</span>
            <span class="ms-2">Merma en edición: <strong>#${mermaId}</strong></span>
            <span class="ms-2 text-muted">(${items} item(s))</span>
        `;
    } else if (items > 0) {
        estadoBox.innerHTML = `
            <span class="badge text-bg-secondary">BORRADOR LOCAL</span>
            <span class="ms-2">Lista preparada, aún no guardada en backend.</span>
        `;
    } else {
        estadoBox.innerHTML = `<span class="text-muted">Sin merma en edición.</span>`;
    }
}

function actualizarResumenMerma() {
    const items = obtenerItemsMermaTabla();
    const resumen = document.getElementById("resumenMerma");

    let cantidadTotal = 0;
    let perdidaTotal = 0;

    items.forEach(item => {
        cantidadTotal += Number(item.cantidad || 0);
        perdidaTotal += Number(item.cantidad || 0) * Number(item.precioActual || 0);
    });

    if (resumen) {
        resumen.innerHTML = `
            <strong>${items.length}</strong> producto(s) ·
            Cantidad total: <strong>${formatearNumero(cantidadTotal)}</strong> ·
            Pérdida estimada: <strong>${formatearMoneda(perdidaTotal)}</strong>
        `;
    }
}

function calcularPerdidaTotalMerma() {
    const items = obtenerItemsMermaTabla();
    return items.reduce((acc, item) => {
        return acc + (Number(item.cantidad || 0) * Number(item.precioActual || 0));
    }, 0);
}

function mostrarCargandoMerma(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoMerma() {
    Swal.close();
}

function mostrarExitoMerma(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        borderRadius: "15px"
    });
}

function mostrarErrorMerma(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
        borderRadius: "15px"
    });
}

function mostrarInfoMerma(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido",
        borderRadius: "15px"
    });
}

async function confirmarSwalMerma(titulo, texto) {
    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Volver",
        reverseButtons: true,
        focusCancel: true,
        borderRadius: "15px"
    });

    return result.isConfirmed;
}

async function leerMensajeErrorMerma(response) {
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

function formatearNumero(valor) {
    return new Intl.NumberFormat("es-PE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
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