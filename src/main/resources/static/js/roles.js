(() => {

    let rolesGlobal = [];
    let rolSeleccionadoId = null;
    let rolSeleccionado = null;
    let modalRol = null;

    async function initRoles() {
        modalRol = new bootstrap.Modal(document.getElementById("modalRol"));
        await cargarRoles();

        if (typeof aplicarPermisosEnVista === "function") {
            aplicarPermisosEnVista();
        }
    }

    async function cargarRoles() {
        const res = await fetch("/api/roles", { credentials: "include" });

        if (!res.ok) {
            alert("No se pudieron cargar los roles.");
            return;
        }

        rolesGlobal = await res.json();
        renderListaRoles();
    }

    function renderListaRoles() {
        const cont = document.getElementById("listaRoles");
        if (!cont) return;

        cont.innerHTML = "";

        if (!rolesGlobal.length) {
            cont.innerHTML = `<div class="dashboard-empty-row">No hay roles disponibles.</div>`;
            return;
        }

        rolesGlobal.forEach(r => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "role-item-btn";
            btn.innerHTML = `
                <div class="role-item-title">${escapeHtml(r.nombre || "Rol")}</div>
                <div class="role-item-meta">
                    ${(r.descripcion && escapeHtml(r.descripcion)) || "Rol configurable"}
                </div>
            `;

            btn.addEventListener("click", () => seleccionarRol(r, btn));
            cont.appendChild(btn);
        });
    }

    async function seleccionarRol(rol, el) {
        rolSeleccionadoId = rol.id;
        rolSeleccionado = rol;

        document.querySelectorAll(".role-item-btn").forEach(i => i.classList.remove("active"));
        el.classList.add("active");

        const subtitulo = document.getElementById("rolesSubtitulo");
        if (subtitulo) {
            subtitulo.textContent = `Configurando permisos para el rol ${rol.nombre}.`;
        }

        const bloqueNombre = document.getElementById("bloqueNombreRol");
        const nombreInput = document.getElementById("nombreRolInput");
        const hint = document.getElementById("rolesNombreHint");
        const btnGuardarPermisos = document.getElementById("btnGuardarPermisosRol");

        if (bloqueNombre) bloqueNombre.classList.remove("d-none");
        if (nombreInput) nombreInput.value = rol.nombre || "";

		const esRolProtegido = ["ADMINISTRADOR"].includes(String(rol.nombre || "").toUpperCase());

		if (hint) {
		    hint.textContent = esRolProtegido
		        ? "Este rol tiene acceso total del sistema. Puedes cambiar el nombre, pero no modificar sus permisos."
		        : "Puedes cambiar el nombre y configurar los permisos de este rol.";
		}

		if (btnGuardarPermisos) {
		    btnGuardarPermisos.disabled = esRolProtegido;
		    btnGuardarPermisos.classList.toggle("disabled", esRolProtegido);
		}

		await cargarPermisosPorRol(rol.id, esRolProtegido);

        if (typeof aplicarPermisosEnVista === "function") {
            aplicarPermisosEnVista();
        }
    }

    async function cargarPermisosPorRol(rolId, deshabilitado = false) {
        const res = await fetch(`/api/permisos/rol/${rolId}`, {
            credentials: "include"
        });

        if (!res.ok) {
            alert("No se pudieron cargar los permisos del rol.");
            return;
        }

        const data = await res.json();
        renderPermisos(data, deshabilitado);
    }

    function renderPermisos(lista, deshabilitado = false) {
        const cont = document.getElementById("contenedorPermisos");
        if (!cont) return;

        cont.innerHTML = "";

        if (!lista.length) {
            cont.innerHTML = `<div class="dashboard-empty-row">No hay permisos configurados.</div>`;
            return;
        }

        const agrupados = {};

        lista.forEach(p => {
            if (!agrupados[p.modulo]) {
                agrupados[p.modulo] = [];
            }
            agrupados[p.modulo].push(p);
        });

        Object.keys(agrupados).forEach(modulo => {
            const permisos = agrupados[modulo];

            const card = document.createElement("div");
            card.className = "roles-modulo-card";

            card.innerHTML = `
                <div class="roles-modulo-head">
                    <h6 class="roles-modulo-title">${escapeHtml(modulo)}</h6>
                    <span class="roles-modulo-count">${permisos.length} permiso(s)</span>
                </div>

                <div class="roles-check-list">
                    ${permisos.map(p => `
                        <div class="roles-check-item ${deshabilitado ? "disabled-role" : ""}">
                            <div class="roles-check-label">
                                <span class="roles-check-title">${escapeHtml(p.accion)}</span>
                                <span class="roles-check-meta">${escapeHtml(p.codigo || "")}</span>
                            </div>

                            <input
                                class="form-check-input roles-switch permiso-check"
                                type="checkbox"
                                value="${p.id}"
                                ${p.asignado ? "checked" : ""}
                                ${deshabilitado ? "disabled" : ""}>
                        </div>
                    `).join("")}
                </div>
            `;

            cont.appendChild(card);
        });
    }

    async function guardarPermisosRol() {
        if (!rolSeleccionadoId || !rolSeleccionado) {
            alert("Selecciona un rol primero.");
            return;
        }

		const esRolProtegido = ["ADMINISTRADOR"].includes(String(rolSeleccionado.nombre || "").toUpperCase());
		if (esRolProtegido) {
		    alert("No se pueden modificar los permisos de este rol.");
		    return;
		}

        const checks = document.querySelectorAll(".permiso-check:checked");
        const ids = [...checks].map(c => Number(c.value));

        const res = await fetch(`/api/permisos/rol/${rolSeleccionadoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                permisoIds: ids
            })
        });

        if (!res.ok) {
            alert("No se pudo guardar.");
            return;
        }

        await cargarPermisosPorRol(rolSeleccionadoId, false);
        alert("Permisos actualizados correctamente.");
    }

    async function guardarNombreRol() {
        if (!rolSeleccionadoId || !rolSeleccionado) {
            alert("Selecciona un rol primero.");
            return;
        }

        const nombre = document.getElementById("nombreRolInput")?.value?.trim();

        if (!nombre) {
            alert("Ingresa un nombre válido.");
            return;
        }

        const res = await fetch(`/api/roles/${rolSeleccionadoId}/nombre`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nombre })
        });

        if (!res.ok) {
            const text = await res.text();
            alert(text || "No se pudo actualizar el nombre del rol.");
            return;
        }

        const actualizado = await res.json();
        rolSeleccionado = actualizado;

        await cargarRoles();

        const nuevoBtn = [...document.querySelectorAll(".role-item-btn")]
            .find(btn => btn.querySelector(".role-item-title")?.textContent?.trim() === actualizado.nombre);

        if (nuevoBtn) {
            nuevoBtn.classList.add("active");
        }

        const subtitulo = document.getElementById("rolesSubtitulo");
        if (subtitulo) {
            subtitulo.textContent = `Configurando permisos para el rol ${actualizado.nombre}.`;
        }

        alert("Nombre del rol actualizado correctamente.");
    }

    function abrirModalRol() {
        document.getElementById("nuevoRolNombre").value = "";
        document.getElementById("nuevoRolDescripcion").value = "";
        ocultarAlertaRol();
        modalRol.show();
    }

    async function guardarNuevoRol() {
        const nombre = document.getElementById("nuevoRolNombre")?.value?.trim();
        const descripcion = document.getElementById("nuevoRolDescripcion")?.value?.trim();

        if (!nombre) {
            mostrarAlertaRol("Ingresa un nombre para el rol.");
            return;
        }

        const res = await fetch("/api/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                nombre,
                descripcion
            })
        });

        const text = await res.text();
        let data = null;

        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = null;
        }

        if (!res.ok) {
            mostrarAlertaRol(data?.message || text || "No se pudo crear el rol.");
            return;
        }

        modalRol.hide();
        await cargarRoles();

        const btn = [...document.querySelectorAll(".role-item-btn")]
            .find(b => b.querySelector(".role-item-title")?.textContent?.trim() === data.nombre);

        if (btn) {
            btn.click();
        }
    }

    function mostrarAlertaRol(msg) {
        const box = document.getElementById("alertRol");
        if (!box) return;
        box.textContent = msg;
        box.classList.remove("d-none");
    }

    function ocultarAlertaRol() {
        const box = document.getElementById("alertRol");
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

    window.initRoles = initRoles;
    window.guardarPermisosRol = guardarPermisosRol;
    window.guardarNombreRol = guardarNombreRol;
    window.abrirModalRol = abrirModalRol;
    window.guardarNuevoRol = guardarNuevoRol;

})();