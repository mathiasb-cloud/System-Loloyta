let modalUsuario = null;
let usuariosGlobal = [];
let rolesGlobal = [];

async function initUsuarios() {
    modalUsuario = new bootstrap.Modal(document.getElementById("modalUsuario"));
    await cargarRolesUsuarios();
    await cargarUsuarios();
    configurarBuscadorUsuarios();

    if (typeof aplicarPermisosEnVista === "function") {
        aplicarPermisosEnVista();
    }
}

async function cargarUsuarios() {
    const res = await fetch("/api/usuarios", { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron cargar los usuarios.");

    usuariosGlobal = await res.json();
    renderTablaUsuarios(usuariosGlobal);
}

async function cargarRolesUsuarios() {
    const res = await fetch("/api/roles", { credentials: "include" });
    if (!res.ok) throw new Error("No se pudieron cargar los roles.");

    rolesGlobal = await res.json();

    const select = document.getElementById("usuarioRol");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione rol</option>`;
    rolesGlobal.forEach(r => {
        select.innerHTML += `<option value="${r.id}">${escapeHtml(r.nombre)}</option>`;
    });
}

function renderTablaUsuarios(data) {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHtml((u.nombre || "") + " " + (u.apellido || ""))}</td>
                <td>${escapeHtml(u.username || "-")}</td>
                <td>${escapeHtml(u.rolNombre || "-")}</td>
                <td>${escapeHtml(u.correo || "-")}</td>
                <td>${escapeHtml(u.dni || "-")}</td>
                <td>${escapeHtml(u.telefono || "-")}</td>
                <td>
                    <span class="badge ${u.activo ? 'badge-soft-success' : 'badge-soft-danger'}">
                        ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarUsuario(${u.id})" data-permiso="USUARIOS_EDITAR">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}"
                                onclick="cambiarEstadoUsuario(${u.id}, ${!u.activo})"
                                data-permiso="USUARIOS_DESACTIVAR">
                            <i class="bi ${u.activo ? 'bi-person-x' : 'bi-person-check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (typeof aplicarPermisosEnVista === "function") {
        aplicarPermisosEnVista();
    }
}

function abrirModalUsuario() {
    limpiarFormularioUsuario();
    modalUsuario.show();
}

function limpiarFormularioUsuario() {
    document.getElementById("usuarioId").value = "";
    document.getElementById("usuarioNombre").value = "";
    document.getElementById("usuarioApellido").value = "";
    document.getElementById("usuarioUsername").value = "";
    document.getElementById("usuarioPassword").value = "";
    document.getElementById("usuarioCorreo").value = "";
    document.getElementById("usuarioDni").value = "";
    document.getElementById("usuarioTelefono").value = "";
    document.getElementById("usuarioRol").value = "";
    document.getElementById("usuarioActivo").value = "true";
    ocultarAlertaUsuario();
}

async function editarUsuario(id) {
    const res = await fetch(`/api/usuarios/${id}`, { credentials: "include" });
    if (!res.ok) {
        alert("No se pudo cargar el usuario.");
        return;
    }

    const u = await res.json();

    document.getElementById("usuarioId").value = u.id || "";
    document.getElementById("usuarioNombre").value = u.nombre || "";
    document.getElementById("usuarioApellido").value = u.apellido || "";
    document.getElementById("usuarioUsername").value = u.username || "";
    document.getElementById("usuarioPassword").value = "";
    document.getElementById("usuarioCorreo").value = u.correo || "";
    document.getElementById("usuarioDni").value = u.dni || "";
    document.getElementById("usuarioTelefono").value = u.telefono || "";
    document.getElementById("usuarioActivo").value = String(u.activo);

    const rol = rolesGlobal.find(r => r.nombre === u.rolNombre);
    document.getElementById("usuarioRol").value = rol ? rol.id : "";

    ocultarAlertaUsuario();
    modalUsuario.show();
}

async function guardarUsuario() {
    const id = document.getElementById("usuarioId").value;
    const payload = {
        nombre: document.getElementById("usuarioNombre").value.trim(),
        apellido: document.getElementById("usuarioApellido").value.trim(),
        username: document.getElementById("usuarioUsername").value.trim(),
        password: document.getElementById("usuarioPassword").value,
        correo: document.getElementById("usuarioCorreo").value.trim() || null,
        dni: document.getElementById("usuarioDni").value.trim() || null,
        telefono: document.getElementById("usuarioTelefono").value.trim() || null,
        rolId: Number(document.getElementById("usuarioRol").value || 0),
        activo: document.getElementById("usuarioActivo").value === "true"
    };

    try {
        let res;

        if (!id) {
            res = await fetch("/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`/api/usuarios/${id}/admin`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
            throw new Error(data?.message || data?.error || "No se pudo guardar el usuario.");
        }

        modalUsuario.hide();
        await cargarUsuarios();
    } catch (error) {
        mostrarAlertaUsuario(error.message || "No se pudo guardar el usuario.");
    }
}

async function cambiarEstadoUsuario(id, activo) {
    const res = await fetch(`/api/usuarios/${id}/estado?activo=${activo}`, {
        method: "PATCH",
        credentials: "include"
    });

    if (!res.ok) {
        alert("No se pudo actualizar el estado.");
        return;
    }

    await cargarUsuarios();
}

function configurarBuscadorUsuarios() {
    const input = document.getElementById("buscadorUsuario");
    if (!input) return;

    input.addEventListener("input", function () {
        const texto = this.value.toLowerCase().trim();

        const filtrados = usuariosGlobal.filter(u => {
            const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
            const username = (u.username || "").toLowerCase();
            return nombreCompleto.includes(texto) || username.includes(texto);
        });

        renderTablaUsuarios(filtrados);
    });
}

function mostrarAlertaUsuario(msg) {
    const box = document.getElementById("usuarioAlert");
    if (!box) return;
    box.textContent = msg;
    box.classList.remove("d-none");
}

function ocultarAlertaUsuario() {
    const box = document.getElementById("usuarioAlert");
    if (!box) return;
    box.textContent = "";
    box.classList.add("d-none");
}

function escapeHtml(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}