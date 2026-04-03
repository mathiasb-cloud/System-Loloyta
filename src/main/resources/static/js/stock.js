let stockGlobal = [];
let almacenesStockGlobal = [];
let productosStockGlobal = [];
let proveedoresStockGlobal = [];

let modalAsignacionStockInstance = null;
let modalProveedorStockInstance = null;

async function initStock() {
    inicializarModalesStock();
    await cargarCatalogosStock();
    await cargarStock();
    configurarFiltrosStock();
}

function inicializarModalesStock() {
    const modalAsignacion = document.getElementById("modalAsignacionStock");
    const modalProveedor = document.getElementById("modalProveedorStock");

    if (modalAsignacion) {
        modalAsignacionStockInstance = new bootstrap.Modal(modalAsignacion);
    }

    if (modalProveedor) {
        modalProveedorStockInstance = new bootstrap.Modal(modalProveedor);
    }
}

async function cargarCatalogosStock() {
    try {
		const [resAlmacenes, resProductos, resProveedores] = await Promise.all([
		    fetch("/api/almacenes/mis-almacenes", { credentials: "include" }),
		    fetch("/api/productos", { credentials: "include" }),
		    fetch("/api/proveedores", { credentials: "include" })
		]);

        almacenesStockGlobal = resAlmacenes.ok ? await resAlmacenes.json() : [];
        const productosJson = resProductos.ok ? await resProductos.json() : [];
        productosStockGlobal = (productosJson.content || productosJson || []).filter(p => p.activo !== false);
        proveedoresStockGlobal = resProveedores.ok ? await resProveedores.json() : [];

        cargarAlmacenesFiltroStock();
        cargarSelectAlmacenesStock();
        cargarSelectProductosStock();
        cargarSelectProveedoresStock();
    } catch (error) {
        console.error(error);
        mostrarErrorStock("No se pudieron cargar los catálogos necesarios.");
    }
}

async function cargarStock() {
    try {
        const res = await fetch("/api/stock", { credentials: "include" });
        if (!res.ok) throw new Error("No se pudo cargar el stock.");

        stockGlobal = await res.json();
        renderStock(stockGlobal);
    } catch (error) {
        console.error(error);
        mostrarErrorStock(error.message || "No se pudo cargar el stock.");
    }
}

function cargarAlmacenesFiltroStock() {
    const select = document.getElementById("filtroAlmacen");
    if (!select) return;

    select.innerHTML = `<option value="">Todos los almacenes</option>`;

    almacenesStockGlobal
        .filter(a => a.activo !== false)
        .forEach(a => {
            select.innerHTML += `<option value="${a.id}">${escapeHtmlStock(a.nombre)}</option>`;
        });
}

function cargarSelectAlmacenesStock() {
    const select = document.getElementById("stockAlmacenId");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione almacén</option>`;

    almacenesStockGlobal
        .filter(a => a.activo !== false)
        .forEach(a => {
            select.innerHTML += `<option value="${a.id}">${escapeHtmlStock(a.nombre)}</option>`;
        });
}

function cargarSelectProductosStock() {
    const select = document.getElementById("stockProductoId");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione producto</option>`;

    productosStockGlobal.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${escapeHtmlStock(p.nombre)}</option>`;
    });
}

function cargarSelectProveedoresStock() {
    const selectAsignacion = document.getElementById("stockProveedorId");
    const selectEdicion = document.getElementById("editarStockProveedorId");

    if (selectAsignacion) {
        selectAsignacion.innerHTML = `<option value="">Sin proveedor</option>`;
        proveedoresStockGlobal
            .filter(p => p.activo !== false)
            .forEach(p => {
                selectAsignacion.innerHTML += `<option value="${p.id}">${escapeHtmlStock(p.nombre)}</option>`;
            });
    }

    if (selectEdicion) {
        selectEdicion.innerHTML = `<option value="">Sin proveedor</option>`;
        proveedoresStockGlobal
            .filter(p => p.activo !== false)
            .forEach(p => {
                selectEdicion.innerHTML += `<option value="${p.id}">${escapeHtmlStock(p.nombre)}</option>`;
            });
    }
}

function configurarFiltrosStock() {
    document.getElementById("buscadorStock")?.addEventListener("input", filtrarStock);
    document.getElementById("filtroAlmacen")?.addEventListener("change", filtrarStock);
}

function filtrarStock() {
    const texto = document.getElementById("buscadorStock")?.value.toLowerCase() || "";
    const almacenId = document.getElementById("filtroAlmacen")?.value || "";

    const filtrados = stockGlobal.filter(s => {
        const nombre = s.producto?.nombre?.toLowerCase() || "";
        const descripcion = s.producto?.descripcion?.toLowerCase() || "";
        const proveedor = s.proveedor?.nombre?.toLowerCase() || "";
        const coincideTexto =
            nombre.includes(texto) ||
            descripcion.includes(texto) ||
            proveedor.includes(texto);

        const coincideAlmacen = !almacenId || String(s.almacenes?.id) === String(almacenId);

        return coincideTexto && coincideAlmacen;
    });

    renderStock(filtrados);
}

function obtenerEstadoStock(cantidad, stockMinimo) {
    const cant = Number(cantidad ?? 0);
    const min = Number(stockMinimo ?? 0);

    if (cant < min) {
        return {
            badgeClass: "stock-badge-low",
            rowClass: "stock-row-low",
            icon: "bi bi-exclamation-triangle-fill"
        };
    }

    if (cant === min) {
        return {
            badgeClass: "stock-badge-min",
            rowClass: "stock-row-min",
            icon: "bi bi-exclamation-circle-fill"
        };
    }

    return {
        badgeClass: "stock-badge-ok",
        rowClass: "",
        icon: "bi bi-check-circle-fill"
    };
}

function renderStock(data) {
    const tbody = document.querySelector("#tablaStock tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    No hay productos asignados a almacenes.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(s => {
        const stockMinimo = Number(s.producto?.stockMinimo ?? 0);
        const cantidad = Number(s.cantidad ?? 0);
        const estado = obtenerEstadoStock(cantidad, stockMinimo);

        tbody.innerHTML += `
            <tr class="${estado.rowClass}">
                <td>${s.producto?.id ?? "N/A"}</td>
                <td class="fw-semibold">${escapeHtmlStock(s.producto?.nombre || "N/A")}</td>
                <td>${escapeHtmlStock(s.producto?.descripcion || "-")}</td>
                <td>${escapeHtmlStock(s.producto?.unidadMedida || "-")}</td>
                <td>${stockMinimo}</td>
                <td>${escapeHtmlStock(s.almacenes?.nombre || "N/A")}</td>
                <td>${escapeHtmlStock(s.proveedor?.nombre || "Sin proveedor")}</td>
                <td>
                    <span class="stock-badge ${estado.badgeClass}">
                        <i class="${estado.icon} me-2"></i>
                        ${cantidad}
                    </span>
                </td>
                <td>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onclick="abrirModalEditarProveedor(${s.producto?.id}, ${s.almacenes?.id}, ${s.proveedor?.id ?? 'null'})"
                    >
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function abrirModalAsignacionStock() {
    document.getElementById("stockAlmacenId").value = "";
    document.getElementById("stockProductoId").value = "";
    document.getElementById("stockProveedorId").value = "";
    modalAsignacionStockInstance?.show();
}

async function guardarAsignacionStock() {
    const almacenId = document.getElementById("stockAlmacenId")?.value;
    const productoId = document.getElementById("stockProductoId")?.value;
    const proveedorId = document.getElementById("stockProveedorId")?.value;

    if (!almacenId) {
        mostrarInfoStock("Selecciona un almacén.");
        return;
    }

    if (!productoId) {
        mostrarInfoStock("Selecciona un producto.");
        return;
    }

    try {
        mostrarCargandoStock("Asignando producto al almacén...");

        const params = new URLSearchParams({
            almacenId,
            productoId
        });

        if (proveedorId) {
            params.append("proveedorId", proveedorId);
        }

		const res = await fetch(`/api/stock/asignar?${params.toString()}`, {
		    method: "POST",
		    credentials: "include"
		});

        if (!res.ok) {
            const msg = await leerMensajeErrorStock(res);
            throw new Error(msg || "No se pudo asignar el producto.");
        }

        cerrarCargandoStock();
        modalAsignacionStockInstance?.hide();
        await cargarStock();
        mostrarExitoStock("Producto asignado correctamente al almacén.");
    } catch (error) {
        console.error(error);
        cerrarCargandoStock();
        mostrarErrorStock(error.message || "No se pudo asignar el producto.");
    }
}

function abrirModalEditarProveedor(productoId, almacenId, proveedorId) {
    document.getElementById("editarStockProductoId").value = productoId;
    document.getElementById("editarStockAlmacenId").value = almacenId;
    document.getElementById("editarStockProveedorId").value = proveedorId && proveedorId !== "null" ? String(proveedorId) : "";
    modalProveedorStockInstance?.show();
}

async function guardarProveedorStock() {
    const productoId = document.getElementById("editarStockProductoId")?.value;
    const almacenId = document.getElementById("editarStockAlmacenId")?.value;
    const proveedorId = document.getElementById("editarStockProveedorId")?.value;

    try {
        mostrarCargandoStock("Actualizando proveedor...");

        const params = new URLSearchParams({
            productoId,
            almacenId
        });

        if (proveedorId) {
            params.append("proveedorId", proveedorId);
        }

		const res = await fetch(`/api/stock/proveedor?${params.toString()}`, {
		    method: "PATCH",
		    credentials: "include"
		});

        if (!res.ok) {
            const msg = await leerMensajeErrorStock(res);
            throw new Error(msg || "No se pudo actualizar el proveedor.");
        }

        cerrarCargandoStock();
        modalProveedorStockInstance?.hide();
        await cargarStock();
        mostrarExitoStock("Proveedor actualizado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoStock();
        mostrarErrorStock(error.message || "No se pudo actualizar el proveedor.");
    }
}

function escapeHtmlStock(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarCargandoStock(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoStock() {
    Swal.close();
}

function mostrarExitoStock(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarErrorStock(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoStock(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

async function leerMensajeErrorStock(response) {
    try {
        return await response.text();
    } catch {
        return null;
    }
}