let localesGlobal = [];
let almacenesLocalesGlobal = [];
let modalLocalInstance = null;


async function initLocales() {
    inicializarModalLocal();
    await cargarAlmacenesLocalesCrud();
    configurarBuscadorLocal();
    await cargarLocalesCrud();
}

function inicializarModalLocal() {
    const modal = document.getElementById("modalLocal");
    if (!modal) return;
    modalLocalInstance = new bootstrap.Modal(modal);
}

async function cargarLocalesCrud() {
    try {
        const res = await fetch("/api/locales");
        if (!res.ok) throw new Error("No se pudo cargar la lista de locales.");

        localesGlobal = await res.json();
        renderTablaLocales(localesGlobal);
    } catch (error) {
        console.error(error);
        mostrarErrorLocal(error.message || "No se pudieron cargar los locales.");
    }
}

function renderTablaLocales(data) {
    const tbody = document.querySelector("#tablaLocales tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    No hay locales registrados.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.id ?? "-"}</td>
                <td class="fw-semibold">${escapeHtmlLocal(l.nombre || "-")}</td>
                <td>${escapeHtmlLocal(l.ubicacion || "-")}</td>
                <td>${escapeHtmlLocal(l.almacen?.nombre || "Sin almacén")}</td>
                <td>
                    <span class="badge ${l.activo ? 'text-bg-success' : 'text-bg-secondary'}">
                        ${l.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatearFechaLocal(l.fechaCreacion)}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarLocal(${l.id})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick='desactivarLocalCrud(${l.id}, ${JSON.stringify(l.nombre || "")})'>
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}



async function cargarAlmacenesLocalesCrud() {
    try {
        const res = await fetch("/api/almacenes");
        if (!res.ok) throw new Error("No se pudieron cargar los almacenes.");

        almacenesLocalesGlobal = await res.json();

        const select = document.getElementById("localAlmacenId");
        if (!select) return;

        select.innerHTML = `<option value="">Seleccione almacén</option>`;

        almacenesLocalesGlobal
            .filter(a => a.activo !== false)
            .forEach(a => {
                select.innerHTML += `<option value="${a.id}">${escapeHtmlLocal(a.nombre || "")}</option>`;
            });
    } catch (error) {
        console.error(error);
        mostrarErrorLocal(error.message || "No se pudieron cargar los almacenes.");
    }
}

function configurarBuscadorLocal() {
    const input = document.getElementById("buscadorLocal");
    const btnLimpiar = document.getElementById("limpiarBuscadorLocal");

    if (!input) return;

    input.addEventListener("input", function () {
        const texto = this.value.trim().toLowerCase();

        if (btnLimpiar) {
            btnLimpiar.classList.toggle("d-none", !texto);
        }

        const filtrados = localesGlobal.filter(l => {
            const nombre = (l.nombre || "").toLowerCase();
            const ubicacion = (l.ubicacion || "").toLowerCase();
            return nombre.includes(texto) || ubicacion.includes(texto);
        });

        renderTablaLocales(filtrados);
    });
}

function limpiarBuscadorLocal() {
    const input = document.getElementById("buscadorLocal");
    const btnLimpiar = document.getElementById("limpiarBuscadorLocal");

    if (input) input.value = "";
    if (btnLimpiar) btnLimpiar.classList.add("d-none");

    renderTablaLocales(localesGlobal);
}

function abrirModalLocal() {
    limpiarFormularioLocal();
    setTituloModalLocal("Nuevo Local", "Completa la información del local.");
    modalLocalInstance?.show();
}

function editarLocal(id) {
    const local = localesGlobal.find(l => Number(l.id) === Number(id));
    if (!local) {
        mostrarErrorLocal("No se encontró el local seleccionado.");
        return;
    }

    limpiarFormularioLocal();
    setTituloModalLocal("Editar Local", "Actualiza la información del local.");

    document.getElementById("localId").value = local.id ?? "";
    document.getElementById("localNombre").value = local.nombre ?? "";
    document.getElementById("localUbicacion").value = local.ubicacion ?? "";
    document.getElementById("localActivo").value = String(Boolean(local.activo));
    document.getElementById("localAlmacenId").value = local.almacen?.id ? String(local.almacen.id) : "";

    modalLocalInstance?.show();
}

async function guardarLocal() {
    if (!validarFormularioLocal()) return;

    const id = document.getElementById("localId").value;
    const payload = {
        nombre: document.getElementById("localNombre").value.trim(),
        ubicacion: document.getElementById("localUbicacion").value.trim(),
        activo: document.getElementById("localActivo").value === "true",
        almacen: {
            id: Number(document.getElementById("localAlmacenId").value)
        }
    };

    try {
        mostrarCargandoLocal(id ? "Guardando cambios..." : "Creando local...");

        const res = await fetch(id ? `/api/locales/${id}` : "/api/locales", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorLocal(res);
            throw new Error(msg || "No se pudo guardar el local.");
        }

        cerrarCargandoLocal();
        modalLocalInstance?.hide();
        await cargarLocalesCrud();
        mostrarExitoLocal(id ? "Local actualizado correctamente." : "Local creado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoLocal();
        mostrarErrorLocal(error.message || "No se pudo guardar el local.");
    }
}

async function desactivarLocalCrud(id, nombre) {
    const ok = await confirmarSwalLocal(
        "Desactivar local",
        `Se desactivará "${nombre || "este local"}".`,
        "Sí, desactivar"
    );

    if (!ok) return;

    try {
        mostrarCargandoLocal("Desactivando local...");

        const res = await fetch(`/api/locales/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const msg = await leerMensajeErrorLocal(res);
            throw new Error(msg || "No se pudo desactivar el local.");
        }

        cerrarCargandoLocal();
        await cargarLocalesCrud();
        mostrarExitoLocal("Local desactivado correctamente.");
    } catch (error) {
        console.error(error);
        cerrarCargandoLocal();
        mostrarErrorLocal(error.message || "No se pudo desactivar el local.");
    }
}

function validarFormularioLocal() {
    const nombre = document.getElementById("localNombre")?.value.trim() || "";
    const ubicacion = document.getElementById("localUbicacion")?.value.trim() || "";
    const almacenId = document.getElementById("localAlmacenId")?.value || "";

    if (nombre.length < 2) {
        mostrarInfoLocal("El nombre del local debe tener al menos 2 caracteres.");
        return false;
    }

    if (ubicacion.length < 2) {
        mostrarInfoLocal("La ubicación debe tener al menos 2 caracteres.");
        return false;
    }

    if (!almacenId) {
        mostrarInfoLocal("Selecciona el almacén asociado al local.");
        return false;
    }

    return true;
}

function limpiarFormularioLocal() {
    document.getElementById("localId").value = "";
    document.getElementById("localNombre").value = "";
    document.getElementById("localUbicacion").value = "";
    document.getElementById("localActivo").value = "true";
    document.getElementById("localAlmacenId").value = "";
}

function setTituloModalLocal(titulo, subtitulo) {
    const modal = document.getElementById("modalLocal");
    if (!modal) return;

    const tituloEl = modal.querySelector(".modal-title");
    const subEl = modal.querySelector(".modal-header small");

    if (tituloEl) tituloEl.textContent = titulo;
    if (subEl) subEl.textContent = subtitulo;
}

function formatearFechaLocal(valor) {
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

function escapeHtmlLocal(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarCargandoLocal(titulo = "Procesando...") {
    Swal.fire({
        title: titulo,
        text: "Por favor espera",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });
}

function cerrarCargandoLocal() {
    Swal.close();
}

function mostrarExitoLocal(mensaje = "Operación realizada correctamente") {
    Swal.fire({
        title: "¡Buen trabajo!",
        text: mensaje,
        icon: "success",
        timer: 1800,
        showConfirmButton: false
    });
}

function mostrarErrorLocal(mensaje = "Ocurrió un error") {
    Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido"
    });
}

function mostrarInfoLocal(mensaje = "Verifica la información") {
    Swal.fire({
        title: "Atención",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido"
    });
}

async function confirmarSwalLocal(titulo, texto, confirmText = "Sí, continuar") {
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

async function leerMensajeErrorLocal(response) {
    try {
        const text = await response.text();
        return text || null;
    } catch {
        return null;
    }
}