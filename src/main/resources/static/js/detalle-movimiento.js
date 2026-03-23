document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const referencia = params.get("ref");

    if (!referencia) {
        renderError("No se recibió la referencia del movimiento.");
        return;
    }

    await cargarDetalleMovimiento(referencia);
});

async function cargarDetalleMovimiento(referencia) {
    try {
        const response = await fetch(`/api/movimientos/detalle/${encodeURIComponent(referencia)}`);

        if (!response.ok) {
            throw new Error("No se pudo cargar el detalle del movimiento.");
        }

        const data = await response.json();
        renderDetalleMovimiento(data);

    } catch (error) {
        console.error(error);
        renderError(error.message || "Ocurrió un error al obtener el detalle.");
    }
}

function renderDetalleMovimiento(m) {
    const contenedor = document.getElementById("detalleMovimiento");
    const productos = Array.isArray(m.productos) ? m.productos : [];

    let totalCalculadoJs = 0;
    const esIngreso = m.tipo === "INGRESO";

    const filasProductos = productos.map((item, index) => {
        const cantidad = Number(item.cantidad || 0);
        const precio = Number(item.precioActual || 0);

        const importeBackend = Number(item.importe || 0);
        const importe = importeBackend > 0 ? importeBackend : (cantidad * precio);

        totalCalculadoJs += importe;

        return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                    <div class="fw-semibold">${item.productoNombre ?? "-"}</div>
                    <small class="text-muted">${item.descripcion ?? "Sin descripción"}</small>
                </td>
                <td>${item.categoria ?? "-"}</td>
                <td class="text-center">${item.unidadMedida ?? "-"}</td>
                <td class="text-center">${formatearNumero(cantidad)}</td>
                <td class="text-end">${formatearMoneda(precio)}</td>
                ${esIngreso ? `<td class="text-center">${item.metodoPago ?? "-"}</td>` : ""}
                <td class="text-end fw-semibold">${formatearMoneda(importe)}</td>
            </tr>
        `;
    }).join("");

    const fecha = formatearFechaHora(m.fecha);
    const badgeTipo = obtenerBadgeTipo(m.tipo);

    contenedor.innerHTML = `
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-4 align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center gap-3 flex-wrap mb-2">
                            <span class="badge ${badgeTipo} px-3 py-2 fs-6">${m.tipo ?? "-"}</span>
                            <span class="text-muted">Referencia: <strong>${m.referencia ?? "-"}</strong></span>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <small class="text-muted d-block">Fecha del movimiento</small>
                                <strong>${fecha}</strong>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted d-block">Almacén</small>
                                <strong>${m.almacenNombre ?? "-"}</strong>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted d-block">Usuario</small>
                                <strong>${m.usuarioNombre ?? "-"}</strong>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted d-block">Total de items</small>
                                <strong>${m.totalItems ?? productos.length}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="border rounded-4 p-3 bg-light text-md-end">
                            <small class="text-muted d-block">Importe total calculado</small>
                            <div class="fs-3 fw-bold text-primary">${formatearMoneda(totalCalculadoJs)}</div>
                            <small class="text-muted">Revisa</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${renderDocumentoRelacionado(m)}

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
                <span><i class="bi bi-box-seam me-2"></i>Detalle de Productos</span>
                <span class="text-muted small">${productos.length} producto(s)</span>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light text-center">
                        <tr>
                            <th style="width: 60px;">#</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th style="width: 110px;">Unidad</th>
                            <th style="width: 120px;">Cantidad</th>
                            <th style="width: 140px;">Precio</th>
                            ${esIngreso ? `<th style="width: 160px;">Método de Pago</th>` : ""}
                            <th style="width: 150px;">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasProductos || `
                            <tr>
                                <td colspan="${esIngreso ? 8 : 7}" class="text-center py-4 text-muted">
                                    No hay productos asociados a este movimiento.
                                </td>
                            </tr>
                        `}
                    </tbody>
                    <tfoot class="table-light">
                        <tr>
                            <th colspan="${esIngreso ? 7 : 6}" class="text-end">Importe Total</th>
                            <th class="text-end fs-6">${formatearMoneda(totalCalculadoJs)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

function renderDocumentoRelacionado(m) {
    if (m.referencia && m.referencia.startsWith("OC-")) {
        return `
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white fw-semibold">
                    <i class="bi bi-receipt me-2"></i>Detalle de Orden de Compra
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <small class="text-muted d-block">ID Orden</small>
                            <strong>${m.ordenCompraId ?? "-"}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Fecha</small>
                            <strong>${formatearFechaHora(m.ordenCompraFecha)}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Estado</small>
                            <strong>${m.ordenCompraEstado ?? "-"}</strong>
                        </div>
                        <div class="col-md-12">
                            <small class="text-muted d-block">Monto total registrado</small>
                            <strong>${formatearMoneda(m.ordenCompraMontoTotal || 0)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (m.referencia && m.referencia.startsWith("SAL-")) {
        return `
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white fw-semibold">
                    <i class="bi bi-truck me-2"></i>Detalle de Salida
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <small class="text-muted d-block">ID Salida</small>
                            <strong>${m.salidaId ?? "-"}</strong>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted d-block">Fecha</small>
                            <strong>${formatearFechaHora(m.salidaFecha)}</strong>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted d-block">Estado</small>
                            <strong>${m.salidaEstado ?? "-"}</strong>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted d-block">Local destino</small>
                            <strong>${m.localDestinoNombre ?? "-"}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return "";
}

function obtenerBadgeTipo(tipo) {
    if (tipo === "INGRESO") return "bg-success";
    if (tipo === "SALIDA") return "bg-warning text-dark";
    if (tipo === "MERMA") return "bg-danger";
    return "bg-secondary";
}

function formatearFechaHora(valor) {
    if (!valor) return "-";

    const fecha = new Date(valor);
    return fecha.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
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

function volverMovimientos() {
    window.location.href = "/movimientos";
}

function renderError(mensaje) {
    const contenedor = document.getElementById("detalleMovimiento");
    contenedor.innerHTML = `
        <div class="alert alert-danger shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${mensaje}
        </div>
    `;
}