let almacenesGlobal = [];
let modalAlmacenInstance = null;

async function initAlmacenes() {
    inicializarModalAlmacen();
    configurarBuscadorAlmacen();
    await cargarAlmacenes();
}

function inicializarModalAlmacen() {
    const modal = document.getElementById("modalAlmacen");
    if (!modal) return;
    modalAlmacenInstance = new bootstrap.Modal(modal);
}

async function cargarAlmacenes() {
    try {
        const res = await fetch("/api/almacenes");
        if (!res.ok) throw new Error("No se pudo cargar la lista de almacenes.");

        almacenesGlobal = await res.json();
        renderTablaAlmacenes(almacenesGlobal);
    } catch (error) {
        console.error(error);
        mostrarErrorAlmacen(error.message || "No se pudieron cargar los almacenes.");
    }
}

function renderTablaAlmacenes(data) {
    const tbody = document.querySelector("#tablaAlmacenes tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    No hay almacenes registrados.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.id ?? "-"}</td>
                <td class="fw-semibold">${escapeHtmlAlmacen(a.nombre || "-")}</td>
                <td>${escapeHtmlAlmacen(a.ubicacion || "-")}</td>
                <td>
                    <span class="badge ${a.activo ? 'text-bg-success' : 'text-bg-secondary'}">
                        ${a.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatearFechaAlmacen(a.fechaCreacion)}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarAlmacen(${a.id})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick='eliminarAlmacen(${a.id}, ${JSON.stringify(a.nombre || "")})'>
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function configurarBuscadorAlmacen() {
    const input = document.getElementById("buscadorAlmacen");
    const btnLimpiar = document.getElementById("limpiarBuscadorAlmacen");

    if (!input) return;

    input.addEventListener("input", function () {
        const texto = this.value.trim().toLowerCase();

        if (btnLimpiar) {
            btnLimpiar.classList.toggle("d-none", !texto);
        }

        const filtrados = almacenesGlobal.filter(a => {
            const nombre = (a.nombre || "").toLowerCase();
            const ubicacion = (a.ubicacion || "").toLowerCase();
            return nombre.includes(texto) || ubicacion.includes(texto);
        });

        renderTablaAlmacenes(filtrados);
    });
}

function limpiarBuscadorAlmacen() {
    const input = document.getElementById("buscadorAlmacen");
    const btnLimpiar = document.getElementById("limpiarBuscadorAlmacen");

    if (input) input.value = "";
    if (btnLimpiar) btnLimpiar.classList.add("d-none");

    renderTablaAlmacenes(almacenesGlobal);
}

function abrirModalAlmacen() {
    limpiarFormularioAlmacen();
    setTituloModalAlmacen("Nuevo Almacén", "Completa la información del almacén.");
    modalAlmacenInstance?.show();
}

function editarAlmacen(id) {
    const almacen = almacenesGlobal.find(a => Number(a.id) === Number(id));
    if (!almacen) {
        mostrarErrorAlmacen("No se encontró el almacén seleccionado.");
        return;
    }

    limpiarFormularioAlmacen();
    setTituloModalAlmacen("Editar Almacén", "Actualiza la información del almacén.");

    document.getElementById("almacenId").value = almacen.id ?? "";
    document.getElementById("almacenNombre").value = almacen.nombre ?? "";
    document.getElementById("almacenUbicacion").value = almacen.ubicacion ?? "";
    document.getElementById("almacenActivo").value = String(Boolean(almacen.activo));

    modalAlmacenInstance?.show();
}

async function guardarAlmacen() {
    if (!validarFormularioAlmacen()) return;

    const id = document.getElementById("almacenId").value;
    const payload = {
        nombre: document.getElementById("almacenNombre").value.trim(),
        ubicacion: document.getElementById("almacenUbicacion").value.trim(),
        activo: document.getElementById("almacenActivo").value === "true"
    };

    try {
        mostrarCargandoAlmacen(id ? "Guardando cambios..." : "Creando almacén...");

        const res = await fetch(id ? `/api/almacenes/${id}` : "/api/almacenes", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorAlmacen(res);
            throw new Error(msg || "No se pudo guardar el almacén.");
        }

        cerrarCargandoAlmacen();
        modalAlmacenInstance?.hide();
        await cargarAlmacenes();
        mostrarExitoAlmacen(id ? "Almacén actualizado correctamente." : "Almacén creado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoAlmacen();
        mostrarErrorAlmacen(error.message || "No se pudo guardar el almacén.");
    }
}

async function eliminarAlmacen(id, nombre) {
    const ok = await confirmarSwalAlmacen(
        "Eliminar almacén",
        `Se eliminará "${nombre || "este almacén"}". Esta acción puede afectar registros relacionados.`,
        "Sí, eliminar"
    );

    if (!ok) return;

    try {
        mostrarCargandoAlmacen("Eliminando almacén...");

        const res = await fetch(`/api/almacenes/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorAlmacen(res);
            throw new Error(msg || "No se pudo eliminar el almacén.");
        }

        cerrarCargandoAlmacen();
        await cargarAlmacenes();
        mostrarExitoAlmacen("Almacén eliminado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoAlmacen();
        mostrarErrorAlmacen(error.message || "No se pudo eliminar el almacén.");
    }
}

function validarFormularioAlmacen() {
    const nombre = document.getElementById("almacenNombre")?.value.trim() || "";
    const ubicacion = document.getElementById("almacenUbicacion")?.value.trim() || "";

    if (nombre.length < 2) {
        mostrarInfoAlmacen("El nombre del almacén debe tener al menos 2 caracteres.");
        return false;
    }

    if (ubicacion.length < 2) {
        mostrarInfoAlmacen("La ubicación debe tener al menos 2 caracteres.");
        return false;
    }

    return true;
}

function limpiarFormularioAlmacen() {
    document.getElementById("almacenId").value = "";
    document.getElementById("almacenNombre").value = "";
    document.getElementById("almacenUbicacion").value = "";
    document.getElementById("almacenActivo").value = "true";

    const alert = document.getElementById("almacenFormAlert");
    if (alert) {
        alert.classList.add("d-none");
        alert.textContent = "";
    }
}

function setTituloModalAlmacen(titulo, subtitulo) {
    const modal = document.getElementById("modalAlmacen");
    if (!modal) return;

    const tituloEl = modal.querySelector(".modal-title");
    const subEl = modal.querySelector(".modal-header small");

    if (tituloEl) tituloEl.textContent = titulo;
    if (subEl) subEl.textContent = subtitulo;
}

function formatearFechaAlmacen(valor) {
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

function escapeHtmlAlmacen(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarCargandoAlmacen(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoAlmacen() {
    Swal.close();
}

function mostrarExitoAlmacen(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarErrorAlmacen(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoAlmacen(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

async function confirmarSwalAlmacen(titulo, texto, confirmText = "Sí, continuar") {
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

async function leerMensajeErrorAlmacen(response) {
    try {
        const text = await response.text();
        return text || null;
    } catch {
        return null;
    }
}