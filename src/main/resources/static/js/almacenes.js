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
    const contenedor = document.getElementById("contenedorAlmacenesCards");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!data.length) {
        contenedor.innerHTML = `
            <div class="almacen-empty-state">
                <div class="almacen-empty-icon">
                    <i class="bi bi-box-seam"></i>
                </div>
                <h5 class="mb-2">No hay almacenes registrados</h5>
                <p class="text-muted mb-0">Crea tu primer almacén para comenzar a organizar el stock.</p>
            </div>
        `;
        return;
    }

    data.forEach(a => {
        const activo = Boolean(a.activo);
        const iniciales = obtenerInicialesAlmacen(a.nombre || "AL");

        contenedor.innerHTML += `
            <div class="almacen-item">
                <div class="card h-100 border-0 shadow-sm hover-elevate almacen-card-modern">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="almacen-avatar me-3">
                                ${iniciales}
                            </div>

                            <div class="flex-grow-1">
                                <h5 class="card-title mb-0 fw-bold">
                                    ${escapeHtmlAlmacen(a.nombre || "-")}
                                </h5>
                                <small class="text-muted">
                                    <i class="bi bi-geo-alt me-1"></i>
                                    ${escapeHtmlAlmacen(a.ubicacion || "Sin ubicación registrada")}
                                </small>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mb-3 flex-wrap">
                            <span class="badge rounded-pill ${activo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">
                                ${activo ? "Activo" : "Inactivo"}
                            </span>

                            <span class="badge rounded-pill bg-almacen-soft text-almacen">
                                ID #${a.id ?? "-"}
                            </span>
                        </div>

                        <hr class="text-muted opacity-25">

                        <div class="almacen-info-lista">
                            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded-3">
                                <span class="small fw-bold">
                                    <i class="bi bi-calendar3 text-almacen me-2"></i>
                                    Fecha de creación
                                </span>
                                <span class="small text-muted fw-semibold">
                                    ${formatearFechaAlmacen(a.fechaCreacion)}
                                </span>
                            </div>

                            <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                                <span class="small fw-bold">
                                    <i class="bi bi-boxes text-warning me-2"></i>
                                    Estado operativo
                                </span>
                                <span class="badge rounded-pill ${activo ? 'bg-success' : 'bg-secondary'}">
                                    ${activo ? "Disponible" : "Pausado"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer bg-transparent border-0 pb-3">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary w-100 rounded-pill shadow-sm fw-bold"
                                    onclick="editarAlmacen(${a.id})">
                                <i class="bi bi-pencil-square me-1"></i>
                                Editar
                            </button>

                            <button class="btn btn-outline-danger w-100 rounded-pill shadow-sm fw-bold"
                                    onclick='eliminarAlmacen(${a.id}, ${JSON.stringify(a.nombre || "")})'>
                                <i class="bi bi-trash me-1"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function obtenerInicialesAlmacen(nombre) {
    const palabras = String(nombre || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (palabras.length === 0) return "AL";
    if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase();

    return (palabras[0][0] + palabras[1][0]).toUpperCase();
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