let almacenesAuditoriaGlobal = [];
let proveedoresAuditoriaGlobal = [];
let auditoriaProductosGlobal = [];
let auditoriaProductosOriginal = [];

async function initStockAuditoria() {
    await cargarCatalogosAuditoriaStock();
    configurarEventosAuditoriaStock();
}

async function cargarCatalogosAuditoriaStock() {
    try {
        const [resAlmacenes, resProveedores] = await Promise.all([
            fetch("/api/almacenes/mis-almacenes", { credentials: "include" }),
            fetch("/api/proveedores", { credentials: "include" })
        ]);

        almacenesAuditoriaGlobal = resAlmacenes.ok ? await resAlmacenes.json() : [];
        proveedoresAuditoriaGlobal = resProveedores.ok ? await resProveedores.json() : [];

        const select = document.getElementById("auditoriaAlmacenId");
        if (select) {
            select.innerHTML = `<option value="">Seleccione almacén</option>`;
            almacenesAuditoriaGlobal
                .filter(a => a.activo !== false)
                .forEach(a => {
                    select.innerHTML += `<option value="${a.id}">${escapeHtmlAuditoria(a.nombre)}</option>`;
                });
        }
    } catch (error) {
        console.error(error);
        mostrarErrorAuditoriaStock("No se pudieron cargar los catálogos.");
    }
}

function configurarEventosAuditoriaStock() {
    document.getElementById("auditoriaAlmacenId")?.addEventListener("change", async function () {
        const almacenId = this.value;
        actualizarFlujoAuditoriaStock();

        if (!almacenId) {
            auditoriaProductosGlobal = [];
            auditoriaProductosOriginal = [];
            renderTablaAuditoriaStock([]);
            actualizarResumenAuditoriaStock();
            return;
        }

        await cargarAuditoriaStockPorAlmacen(almacenId);
    });

    document.getElementById("buscadorAuditoriaStock")?.addEventListener("input", filtrarAuditoriaStock);
}

async function cargarAuditoriaStockPorAlmacen(almacenId) {
    try {
        mostrarCargandoAuditoriaStock("Cargando auditoría del almacén...");

        const res = await fetch(`/api/stock/auditoria/${almacenId}`, {
            credentials: "include"
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "No se pudo cargar la auditoría.");
        }

        const data = await res.json();

        auditoriaProductosGlobal = data.map(x => ({
            ...x,
            asignado: Boolean(x.asignado),
            proveedorId: x.proveedorId ?? ""
        }));

        auditoriaProductosOriginal = JSON.parse(JSON.stringify(auditoriaProductosGlobal));

        cerrarCargandoAuditoriaStock();
        renderTablaAuditoriaStock(auditoriaProductosGlobal);
        actualizarResumenAuditoriaStock();
    } catch (error) {
        console.error(error);
        cerrarCargandoAuditoriaStock();
        mostrarErrorAuditoriaStock(error.message || "No se pudo cargar la auditoría.");
    }
}

function renderTablaAuditoriaStock(data) {
    const tbody = document.querySelector("#tablaAuditoriaStock tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    Selecciona un almacén para auditar sus productos.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(item => {
        const proveedoresOptions = [
            `<option value="">Sin proveedor</option>`,
            ...proveedoresAuditoriaGlobal
                .filter(p => p.activo !== false)
                .map(p => `<option value="${p.id}" ${String(item.proveedorId) === String(p.id) ? "selected" : ""}>${escapeHtmlAuditoria(p.nombre)}</option>`)
        ].join("");

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="form-check d-flex justify-content-center">
                        <input
                            class="form-check-input auditoria-check"
                            type="checkbox"
                            ${item.asignado ? "checked" : ""}
                            onchange="toggleAsignacionAuditoria(${item.productoId}, this.checked)"
                        >
                    </div>
                </td>
                <td class="fw-semibold text-start">${escapeHtmlAuditoria(item.nombre || "-")}</td>
                <td class="text-start">${escapeHtmlAuditoria(item.descripcion || "-")}</td>
                <td>${escapeHtmlAuditoria(item.categoria || "-")}</td>
                <td>${escapeHtmlAuditoria(item.unidadMedida || "-")}</td>
                <td>
                    <select
                        class="form-select form-select-sm"
                        onchange="cambiarProveedorAuditoria(${item.productoId}, this.value)"
                        ${!item.asignado ? "disabled" : ""}
                    >
                        ${proveedoresOptions}
                    </select>
                </td>
                <td>
                    <span class="auditoria-stock-chip ${Number(item.cantidadActual || 0) > 0 ? 'auditoria-stock-chip-ok' : 'auditoria-stock-chip-zero'}">
                        ${item.cantidadActual || 0}
                    </span>
                </td>
            </tr>
        `;
    });
}

function toggleAsignacionAuditoria(productoId, checked) {
    const item = auditoriaProductosGlobal.find(x => Number(x.productoId) === Number(productoId));
    if (!item) return;

    item.asignado = checked;

    if (!checked) {
        item.proveedorId = "";
    }

    renderTablaAuditoriaStock(filtrarDataAuditoriaActual());
    actualizarResumenAuditoriaStock();
}

function cambiarProveedorAuditoria(productoId, proveedorId) {
    const item = auditoriaProductosGlobal.find(x => Number(x.productoId) === Number(productoId));
    if (!item) return;

    item.proveedorId = proveedorId || "";
    actualizarResumenAuditoriaStock();
}

function filtrarAuditoriaStock() {
    renderTablaAuditoriaStock(filtrarDataAuditoriaActual());
    actualizarResumenAuditoriaStock();
}

function filtrarDataAuditoriaActual() {
    const texto = document.getElementById("buscadorAuditoriaStock")?.value.toLowerCase().trim() || "";

    if (!texto) return auditoriaProductosGlobal;

    return auditoriaProductosGlobal.filter(x => {
        const nombre = (x.nombre || "").toLowerCase();
        const descripcion = (x.descripcion || "").toLowerCase();
        const categoria = (x.categoria || "").toLowerCase();

        return nombre.includes(texto) || descripcion.includes(texto) || categoria.includes(texto);
    });
}

function actualizarFlujoAuditoriaStock() {
    const select = document.getElementById("auditoriaAlmacenId");
    const box = document.getElementById("auditoriaAlmacenNombre");

    if (!box || !select) return;

    const texto = select.options[select.selectedIndex]?.text || "Selecciona un almacén para comenzar";
    box.textContent = select.value ? texto : "Selecciona un almacén para comenzar";
}

function actualizarResumenAuditoriaStock() {
    const resumen = document.getElementById("resumenAuditoriaStock");
    if (!resumen) return;

    const total = auditoriaProductosGlobal.length;
    const asignados = auditoriaProductosGlobal.filter(x => x.asignado).length;
    const conProveedor = auditoriaProductosGlobal.filter(x => x.asignado && x.proveedorId).length;

    resumen.innerHTML = `
        <strong>${asignados}</strong> asignado(s) de <strong>${total}</strong> producto(s) ·
        Con proveedor: <strong>${conProveedor}</strong>
    `;
}

function restaurarAuditoriaStock() {
    auditoriaProductosGlobal = JSON.parse(JSON.stringify(auditoriaProductosOriginal));
    renderTablaAuditoriaStock(filtrarDataAuditoriaActual());
    actualizarResumenAuditoriaStock();
}

async function abrirConfirmacionGuardarAuditoriaStock() {
    const almacenId = document.getElementById("auditoriaAlmacenId")?.value;
    if (!almacenId) {
        mostrarInfoAuditoriaStock("Selecciona un almacén para guardar la auditoría.");
        return;
    }

    const ok = await Swal.fire({
        title: "Guardar auditoría",
        text: "Se aplicarán los cambios de asignación y proveedor para este almacén.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Volver",
        reverseButtons: true
    });

    if (!ok.isConfirmed) return;

    const ok2 = await Swal.fire({
        title: "Confirmación final",
        text: "¿Deseas guardar definitivamente los cambios realizados?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    });

    if (!ok2.isConfirmed) return;

    await guardarAuditoriaStock();
}

async function guardarAuditoriaStock() {
    const almacenId = document.getElementById("auditoriaAlmacenId")?.value;

    try {
        mostrarCargandoAuditoriaStock("Guardando auditoría...");

        const payload = {
            almacenId: Number(almacenId),
            items: auditoriaProductosGlobal.map(x => ({
                productoId: x.productoId,
                asignado: x.asignado,
                proveedorId: x.proveedorId ? Number(x.proveedorId) : null
            }))
        };

		const res = await fetch("/api/stock/auditoria/guardar", {
		    method: "POST",
		    headers: {
		        "Content-Type": "application/json"
		    },
		    credentials: "include",
		    body: JSON.stringify(payload)
		});

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "No se pudo guardar la auditoría.");
        }

        cerrarCargandoAuditoriaStock();

        await Swal.fire({
            title: "¡Cambios guardados!",
            text: "La asignación del almacén fue actualizada correctamente.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false
        });

        await cargarAuditoriaStockPorAlmacen(almacenId);
    } catch (error) {
        console.error(error);
        cerrarCargandoAuditoriaStock();
        mostrarErrorAuditoriaStock(error.message || "No se pudo guardar la auditoría.");
    }
}

function escapeHtmlAuditoria(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarCargandoAuditoriaStock(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoAuditoriaStock() {
    Swal.close();
}

function mostrarErrorAuditoriaStock(mensaje) {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoAuditoriaStock(mensaje) {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}