let proveedoresGlobal = [];
let modalProveedorInstance = null;

async function initProveedores() {
    inicializarModalProveedor();
    configurarBuscadorProveedor();
    await cargarProveedoresCrud();
}

function inicializarModalProveedor() {
    const modal = document.getElementById("modalProveedor");
    if (!modal) return;
    modalProveedorInstance = new bootstrap.Modal(modal);
}

async function cargarProveedoresCrud() {
    try {
        const res = await fetch("/api/proveedores");
        if (!res.ok) throw new Error("No se pudo cargar la lista de proveedores.");

        proveedoresGlobal = await res.json();
        renderTablaProveedores(proveedoresGlobal);
    } catch (error) {
        console.error(error);
        mostrarErrorProveedor(error.message || "No se pudieron cargar los proveedores.");
    }
}

function renderTablaProveedores(data) {
    const tbody = document.querySelector("#tablaProveedores tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    No hay proveedores registrados.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id ?? "-"}</td>
                <td class="fw-semibold">${escapeHtmlProveedor(p.nombre || "-")}</td>
                <td>${escapeHtmlProveedor(p.ruc || "-")}</td>
                <td>${escapeHtmlProveedor(p.telefono || "-")}</td>
                <td>${escapeHtmlProveedor(p.correo || "-")}</td>
                <td>${escapeHtmlProveedor(p.direccion || "-")}</td>
                <td>
                    <span class="badge ${p.activo ? 'text-bg-success' : 'text-bg-secondary'}">
                        ${p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatearFechaProveedor(p.fechaCreacion)}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarProveedor(${p.id})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick='eliminarProveedorCrud(${p.id}, ${JSON.stringify(p.nombre || "")})'>
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function configurarBuscadorProveedor() {
    const input = document.getElementById("buscadorProveedor");
    const btnLimpiar = document.getElementById("limpiarBuscadorProveedor");

    if (!input) return;

    input.addEventListener("input", function () {
        const texto = this.value.trim().toLowerCase();

        if (btnLimpiar) {
            btnLimpiar.classList.toggle("d-none", !texto);
        }

        const filtrados = proveedoresGlobal.filter(p => {
            const nombre = (p.nombre || "").toLowerCase();
            const ruc = (p.ruc || "").toLowerCase();
            const telefono = (p.telefono || "").toLowerCase();
            const correo = (p.correo || "").toLowerCase();
            const direccion = (p.direccion || "").toLowerCase();

            return nombre.includes(texto)
                || ruc.includes(texto)
                || telefono.includes(texto)
                || correo.includes(texto)
                || direccion.includes(texto);
        });

        renderTablaProveedores(filtrados);
    });
}

function limpiarBuscadorProveedor() {
    const input = document.getElementById("buscadorProveedor");
    const btnLimpiar = document.getElementById("limpiarBuscadorProveedor");

    if (input) input.value = "";
    if (btnLimpiar) btnLimpiar.classList.add("d-none");

    renderTablaProveedores(proveedoresGlobal);
}

function abrirModalProveedor() {
    limpiarFormularioProveedor();
    setTituloModalProveedor("Nuevo Proveedor", "Completa la información del proveedor.");
    modalProveedorInstance?.show();
}

function editarProveedor(id) {
    const proveedor = proveedoresGlobal.find(p => Number(p.id) === Number(id));
    if (!proveedor) {
        mostrarErrorProveedor("No se encontró el proveedor seleccionado.");
        return;
    }

    limpiarFormularioProveedor();
    setTituloModalProveedor("Editar Proveedor", "Actualiza la información del proveedor.");

    document.getElementById("proveedorId").value = proveedor.id ?? "";
    document.getElementById("proveedorNombre").value = proveedor.nombre ?? "";
    document.getElementById("proveedorRuc").value = proveedor.ruc ?? "";
    document.getElementById("proveedorTelefono").value = proveedor.telefono ?? "";
    document.getElementById("proveedorCorreo").value = proveedor.correo ?? "";
    document.getElementById("proveedorDireccion").value = proveedor.direccion ?? "";
    document.getElementById("proveedorActivo").value = String(Boolean(proveedor.activo));

    modalProveedorInstance?.show();
}

async function guardarProveedor() {
    if (!validarFormularioProveedor()) return;

    const id = document.getElementById("proveedorId").value;

    const payload = {
        nombre: document.getElementById("proveedorNombre").value.trim(),
        ruc: normalizarCampoProveedor(document.getElementById("proveedorRuc").value),
        telefono: normalizarCampoProveedor(document.getElementById("proveedorTelefono").value),
        correo: normalizarCampoProveedor(document.getElementById("proveedorCorreo").value),
        direccion: normalizarCampoProveedor(document.getElementById("proveedorDireccion").value),
        activo: document.getElementById("proveedorActivo").value === "true"
    };

    try {
        mostrarCargandoProveedor(id ? "Guardando cambios..." : "Creando proveedor...");

        const res = await fetch(id ? `/api/proveedores/${id}` : "/api/proveedores", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorProveedor(res);
            throw new Error(msg || "No se pudo guardar el proveedor.");
        }

        cerrarCargandoProveedor();
        modalProveedorInstance?.hide();
        await cargarProveedoresCrud();
        mostrarExitoProveedor(id ? "Proveedor actualizado correctamente." : "Proveedor creado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoProveedor();
        mostrarErrorProveedor(error.message || "No se pudo guardar el proveedor.");
    }
}

async function eliminarProveedorCrud(id, nombre) {
    const ok = await confirmarSwalProveedor(
        "Desactivar proveedor",
        `Se desactivará "${nombre || "este proveedor"}".`,
        "Sí, desactivar"
    );

    if (!ok) return;

    try {
        mostrarCargandoProveedor("Desactivando proveedor...");

        const res = await fetch(`/api/proveedores/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorProveedor(res);
            throw new Error(msg || "No se pudo desactivar el proveedor.");
        }

        cerrarCargandoProveedor();
        await cargarProveedoresCrud();
        mostrarExitoProveedor("Proveedor desactivado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoProveedor();
        mostrarErrorProveedor(error.message || "No se pudo desactivar el proveedor.");
    }
}

function validarFormularioProveedor() {
    const nombre = document.getElementById("proveedorNombre")?.value.trim() || "";
    const correo = document.getElementById("proveedorCorreo")?.value.trim() || "";

    if (nombre.length < 2) {
        mostrarInfoProveedor("El nombre del proveedor debe tener al menos 2 caracteres.");
        return false;
    }

    if (correo && !validarCorreoProveedor(correo)) {
        mostrarInfoProveedor("Ingresa un correo válido.");
        return false;
    }

    return true;
}

function validarCorreoProveedor(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function normalizarCampoProveedor(valor) {
    const limpio = String(valor || "").trim();
    return limpio.length ? limpio : null;
}

function limpiarFormularioProveedor() {
    document.getElementById("proveedorId").value = "";
    document.getElementById("proveedorNombre").value = "";
    document.getElementById("proveedorRuc").value = "";
    document.getElementById("proveedorTelefono").value = "";
    document.getElementById("proveedorCorreo").value = "";
    document.getElementById("proveedorDireccion").value = "";
    document.getElementById("proveedorActivo").value = "true";
}

function setTituloModalProveedor(titulo, subtitulo) {
    const modal = document.getElementById("modalProveedor");
    if (!modal) return;

    const tituloEl = modal.querySelector(".modal-title");
    const subEl = modal.querySelector(".modal-header small");

    if (tituloEl) tituloEl.textContent = titulo;
    if (subEl) subEl.textContent = subtitulo;
}

function formatearFechaProveedor(valor) {
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

function escapeHtmlProveedor(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarCargandoProveedor(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoProveedor() {
    Swal.close();
}

function mostrarExitoProveedor(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarErrorProveedor(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoProveedor(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

async function confirmarSwalProveedor(titulo, texto, confirmText = "Sí, continuar") {
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

async function leerMensajeErrorProveedor(response) {
    try {
        const text = await response.text();
        return text || null;
    } catch {
        return null;
    }
}