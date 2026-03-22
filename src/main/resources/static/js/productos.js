let productosCrud = [];
let modalProducto = null;
let categoriasCrud = [];
let guardandoProducto = false;

function initProductos() {
    const modalElement = document.getElementById('modalProducto');
    if (!modalElement) return;

    modalProducto = new bootstrap.Modal(modalElement);

    cargarCategorias();
    cargarProductosCrud();
    initEventosProducto();
	actualizarBotonLimpiarBuscadorProducto();
}

function initEventosProducto() {
	document.getElementById("buscadorProducto")
	    ?.addEventListener("input", () => {
	        filtrarProductos();
	        actualizarBotonLimpiarBuscadorProducto();
	    });
		document.getElementById("nombre")
		    ?.addEventListener("input", () => {
		        validarCampo("nombre");
		        validarNombreDuplicadoEnTiempoReal();
		    });

    document.getElementById("descripcion")
        ?.addEventListener("input", () => validarCampo("descripcion"));

    document.getElementById("categoria")
        ?.addEventListener("change", () => validarCampo("categoria"));

    document.getElementById("unidad")
        ?.addEventListener("input", () => validarCampo("unidad"));

    document.getElementById("stockMinimo")
        ?.addEventListener("input", () => validarCampo("stockMinimo"));

    document.getElementById("activo")
        ?.addEventListener("change", () => validarCampo("activo"));
		
		document.getElementById("categoriaBusqueda")
		    ?.addEventListener("input", () => {
		        actualizarBotonLimpiarBusquedaCategoria();
		        mostrarDropdownCategorias();
		        validarCampo("categoria");
		    });

		document.getElementById("categoriaBusqueda")
		    ?.addEventListener("focus", () => {
		        mostrarDropdownCategorias();
		    });

		document.addEventListener("click", function(e) {
		    const wrapper = document.querySelector(".category-search-wrapper");
		    const dropdown = document.getElementById("categoriaDropdown");

		    if (!wrapper || !dropdown) return;

		    if (!wrapper.contains(e.target)) {
		        dropdown.classList.add("d-none");
		    }
		});
}


function validarNombreDuplicadoEnTiempoReal() {
    const input = document.getElementById("nombre");
    if (!input) return;

    const nombre = sanitizarTexto(input.value);
    const nombreNormalizado = normalizarTexto(nombre);
    const idActual = String(document.getElementById("productoId").value || "");

    if (!nombreNormalizado) return;

    const duplicado = productosCrud.find(p => {
        const existente = normalizarTexto(p.nombre || "");
        return existente === nombreNormalizado && String(p.id || "") !== idActual;
    });

    if (duplicado) {
        mostrarErrorCampo("nombre", `Ya existe un producto con ese nombre (ID ${duplicado.id}).`);
        return false;
    }

    if (validarCampo("nombre")) {
        mostrarCampoValido("nombre");
    }

    return true;
}

async function cargarProductosCrud() {
    let res = await fetch('/api/productos');
    let data = await res.json();

    productosCrud = Array.isArray(data) ? data : [];
    renderProductos(productosCrud);
}

function renderProductos(data) {
    let tbody = document.querySelector("#tablaProductosCrud tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
            <tr class="row-soft-enter">
                <td>${p.id}</td>
                <td>${escapeHtml(p.categoria?.nombre || "")}</td>
                <td>${escapeHtml(p.nombre || "")}</td>
                <td>${escapeHtml(p.descripcion || "")}</td>
                <td>${escapeHtml(p.unidadMedida || "")}</td>
                <td>${formatearMoneda(p.precioActual)}</td>
                <td>${p.stockMinimo ?? 0}</td>
				<td>
				    ${p.activo
				        ? '<span class="badge badge-soft-success">Activo</span>'
				        : '<span class="badge badge-soft-danger">Inactivo</span>'}
				</td>
                <td>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-warning" onclick='editarProducto(${JSON.stringify(p)})'>✏️</button>
                        <button 
                            class="btn btn-sm ${p.activo ? "btn-danger" : "btn-success"}"
                            onclick='toggleActivo(${p.id}, ${p.activo})'>
                            ${p.activo ? "Desactivar" : "Activar"}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function filtrarProductos() {
    let texto = normalizarTexto(document.getElementById("buscadorProducto")?.value || "");

    if (!texto) {
        renderProductos(productosCrud);
        return;
    }

    let filtrados = productosCrud.filter(p =>
        normalizarTexto(p.nombre || "").includes(texto) ||
        normalizarTexto(p.descripcion || "").includes(texto) ||
        normalizarTexto(p.categoria?.nombre || "").includes(texto) ||
        normalizarTexto(p.unidadMedida || "").includes(texto)
    );

    renderProductos(filtrados);
}

function abrirModal() {
	
	const banner = document.getElementById("productoSuccessBanner");
	if (banner) banner.classList.add("d-none");
    limpiarFormularioProducto();
    limpiarErroresProducto();
    ocultarAlertaFormulario();
    modalProducto.show();
}

function formatearMoneda(valor) {
    const numero = Number(valor || 0);
    return `S/ ${numero.toFixed(2)}`;
}

function editarProducto(p) {
    limpiarErroresProducto();
    ocultarAlertaFormulario();

    document.getElementById("productoId").value = p.id || "";
    document.getElementById("nombre").value = p.nombre || "";
    document.getElementById("descripcion").value = p.descripcion || "";
    document.getElementById("categoria").value = p.categoria?.id || "";
    document.getElementById("categoriaBusqueda").value = p.categoria?.nombre || "";
    document.getElementById("unidad").value = p.unidadMedida || "";
    document.getElementById("stockMinimo").value = p.stockMinimo ?? "";
    document.getElementById("activo").value = String(p.activo);
	document.getElementById("precioActual").value = p.precioActual ?? "";

    const visual = document.getElementById("categoriaSeleccionadaVisual");
    if (visual && p.categoria?.nombre) {
        visual.innerHTML = `
            <div class="selected-category-chip">
                <i class="bi bi-tag"></i>
                <span>${escapeHtml(p.categoria.nombre)}</span>
                <button type="button" onclick="limpiarBusquedaCategoria()" aria-label="Quitar categoría">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
    }

    actualizarBotonLimpiarBusquedaCategoria();
    modalProducto.show();
}

function limpiarFormularioProducto() {
    document.getElementById("productoId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("categoriaBusqueda").value = "";
    document.getElementById("categoriaSeleccionadaVisual").innerHTML = "";
    document.getElementById("unidad").value = "";
    document.getElementById("stockMinimo").value = "";
    document.getElementById("activo").value = "true";
	document.getElementById("precioActual").value = "";

    actualizarBotonLimpiarBusquedaCategoria();
}

function limpiarErroresProducto() {
    ["nombre", "descripcion", "categoria", "unidad", "precioActual", "stockMinimo", "activo"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("is-invalid", "is-valid", "input-valid-soft", "input-invalid-soft");

        const feedback = el.parentElement.querySelector(".invalid-feedback");
        if (feedback) feedback.textContent = "";
    });
}

function mostrarErrorCampo(id, mensaje) {
    if (id === "categoria") {
        const input = document.getElementById("categoriaBusqueda");
        const error = document.getElementById("categoriaError");

        if (input) {
            input.classList.remove("is-valid", "input-valid-soft");
            input.classList.add("is-invalid", "input-invalid-soft");
        }

        if (error) error.textContent = mensaje;
        return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("is-valid", "input-valid-soft");
    el.classList.add("is-invalid", "input-invalid-soft");

    const feedback = el.parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = mensaje;
}

function mostrarCampoValido(id) {
    if (id === "categoria") {
        const input = document.getElementById("categoriaBusqueda");
        const error = document.getElementById("categoriaError");

        if (input) {
            input.classList.remove("is-invalid", "input-invalid-soft");
            input.classList.add("is-valid", "input-valid-soft");
        }

        if (error) error.textContent = "";
        return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("is-invalid", "input-invalid-soft");
    el.classList.add("is-valid", "input-valid-soft");
}

function mostrarAlertaFormulario(mensaje) {
    const alert = document.getElementById("productoFormAlert");
    if (!alert) return;

    alert.textContent = mensaje;
    alert.classList.remove("d-none");
    alert.classList.add("fade-slide-in");
}

function ocultarAlertaFormulario() {
    const alert = document.getElementById("productoFormAlert");
    if (!alert) return;

    alert.textContent = "";
    alert.classList.add("d-none");
    alert.classList.remove("fade-slide-in");
}

function validarCampo(id) {
    const valor = obtenerDatosFormularioProducto()[id];
    let mensaje = "";

    if (id === "nombre") {
        if (!valor) mensaje = "El nombre es obligatorio.";
        else if (valor.length < 2) mensaje = "Debe tener al menos 2 caracteres.";
        else if (valor.length > 80) mensaje = "No debe superar 80 caracteres.";
        else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9().,\-\/ ]+$/.test(valor)) {
            mensaje = "Contiene caracteres no permitidos.";
        }
    }

    if (id === "descripcion") {
        if (valor && valor.length > 180) mensaje = "No debe superar 180 caracteres.";
    }

	if (id === "categoria") {
	    const categoriaId = document.getElementById("categoria")?.value || "";
	    if (!categoriaId) mensaje = "Selecciona una categoría.";
	}

    if (id === "unidad") {
        if (!valor) mensaje = "La unidad es obligatoria.";
        else if (valor.length < 1) mensaje = "Ingresa una unidad válida.";
        else if (valor.length > 20) mensaje = "No debe superar 20 caracteres.";
        else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/.test(valor)) {
            mensaje = "Solo letras, números y espacios.";
        }
    }
	
	if (id === "precioActual") {
	    if (valor === "" || valor === null || valor === undefined) {
	        mensaje = "El precio es obligatorio.";
	    } else if (isNaN(valor)) {
	        mensaje = "Debe ser un número válido.";
	    } else if (Number(valor) < 0) {
	        mensaje = "No puede ser negativo.";
	    } else if (Number(valor) > 999999.99) {
	        mensaje = "El precio es demasiado alto.";
	    }
	}

    if (id === "stockMinimo") {
        if (valor === "" || valor === null || valor === undefined) {
            mensaje = "El stock mínimo es obligatorio.";
        } else if (isNaN(valor)) {
            mensaje = "Debe ser un número válido.";
        } else if (Number(valor) < 0) {
            mensaje = "No puede ser negativo.";
        } else if (Number(valor) > 999999.99) {
            mensaje = "El valor es demasiado alto.";
        }
    }

    if (mensaje) {
        mostrarErrorCampo(id, mensaje);
        return false;
    }

    mostrarCampoValido(id);
    return true;
}

function actualizarBotonLimpiarBusquedaCategoria() {
    const input = document.getElementById("categoriaBusqueda");
    const btn = document.getElementById("limpiarBusquedaCategoria");
    if (!input || !btn) return;

    btn.classList.toggle("d-none", !input.value.trim());
}

function limpiarBusquedaCategoria() {
    const input = document.getElementById("categoriaBusqueda");
    const hidden = document.getElementById("categoria");
    const visual = document.getElementById("categoriaSeleccionadaVisual");
    const dropdown = document.getElementById("categoriaDropdown");

    if (input) input.value = "";
    if (hidden) hidden.value = "";
    if (visual) visual.innerHTML = "";
    if (dropdown) dropdown.classList.add("d-none");

    actualizarBotonLimpiarBusquedaCategoria();
    limpiarErrorCategoriaVisual();
    input?.focus();
}

function mostrarDropdownCategorias() {
    const input = document.getElementById("categoriaBusqueda");
    const dropdown = document.getElementById("categoriaDropdown");
    if (!input || !dropdown) return;

    const texto = normalizarTexto(input.value || "");

    const categoriasFiltradas = categoriasCrud.filter(c =>
        c.activo !== false &&
        normalizarTexto(c.nombre || "").includes(texto)
    );

    if (categoriasFiltradas.length === 0) {
        dropdown.innerHTML = `<div class="category-empty">No se encontraron categorías.</div>`;
        dropdown.classList.remove("d-none");
        return;
    }

    dropdown.innerHTML = categoriasFiltradas.map(c => `
        <div class="category-option" onclick="seleccionarCategoria(${c.id})">
            ${escapeHtml(c.nombre)}
        </div>
    `).join("");

    dropdown.classList.remove("d-none");
}

function seleccionarCategoria(id) {
    const categoria = categoriasCrud.find(c => String(c.id) === String(id));
    if (!categoria) return;

    const hidden = document.getElementById("categoria");
    const input = document.getElementById("categoriaBusqueda");
    const visual = document.getElementById("categoriaSeleccionadaVisual");
    const dropdown = document.getElementById("categoriaDropdown");

    if (hidden) hidden.value = categoria.id;
    if (input) input.value = categoria.nombre;

    if (visual) {
        visual.innerHTML = `
            <div class="selected-category-chip">
                <i class="bi bi-tag"></i>
                <span>${escapeHtml(categoria.nombre)}</span>
                <button type="button" onclick="limpiarBusquedaCategoria()" aria-label="Quitar categoría">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
    }

    if (dropdown) dropdown.classList.add("d-none");

    actualizarBotonLimpiarBusquedaCategoria();
    validarCampo("categoria");
}

function limpiarErrorCategoriaVisual() {
    const input = document.getElementById("categoriaBusqueda");
    const error = document.getElementById("categoriaError");

    if (input) {
        input.classList.remove("is-invalid", "input-invalid-soft", "is-valid", "input-valid-soft");
    }

    if (error) {
        error.textContent = "";
    }
}

function obtenerDatosFormularioProducto() {
    return {
        nombre: sanitizarTexto(document.getElementById("nombre")?.value),
        descripcion: sanitizarTexto(document.getElementById("descripcion")?.value),
        categoria: document.getElementById("categoria")?.value || "",
        unidad: sanitizarTexto(document.getElementById("unidad")?.value),
        precioActual: document.getElementById("precioActual")?.value,
        stockMinimo: document.getElementById("stockMinimo")?.value,
        activo: document.getElementById("activo")?.value
    };
}

function validarFormularioProducto() {
    ocultarAlertaFormulario();

    const campos = ["nombre", "descripcion", "categoria", "unidad","precioActual", "stockMinimo", "activo"];
    let esValido = true;

    campos.forEach(id => {
        if (!validarCampo(id)) esValido = false;
    });

    const datos = obtenerDatosFormularioProducto();

	const idActual = String(document.getElementById("productoId").value || "");
	const nombreNormalizado = normalizarTexto(datos.nombre || "");

	const productoDuplicado = productosCrud.find(p => {
	    const nombreExistente = normalizarTexto(p.nombre || "");
	    const mismoNombre = nombreExistente === nombreNormalizado;
	    const esOtroRegistro = String(p.id || "") !== idActual;
	    return mismoNombre && esOtroRegistro;
	});

	if (nombreNormalizado && productoDuplicado) {
	    mostrarErrorCampo("nombre", `Ya existe un producto con ese nombre (ID ${productoDuplicado.id}).`);
	    mostrarAlertaFormulario("Ese nombre ya está registrado. Usa uno diferente para evitar duplicados.");
	    esValido = false;
	}

    if (!esValido && !document.querySelector("#formProducto .is-invalid")) {
        mostrarAlertaFormulario("Hay campos por corregir antes de guardar.");
    }

    return esValido;
}

async function guardarProducto() {
    if (guardandoProducto) return;

	const formularioValido = validarFormularioProducto();
	const nombreValido = validarNombreDuplicadoEnTiempoReal();

	if (!formularioValido || !nombreValido) {
	    mostrarToast("Revisa los campos marcados antes de guardar.", "warning");
	    return;
	}

    guardandoProducto = true;
    setGuardandoUI(true);

    try {
        let id = document.getElementById("productoId").value;
        let categoriaId = document.getElementById("categoria").value;

		let body = {
		    nombre: sanitizarTexto(document.getElementById("nombre").value),
		    descripcion: sanitizarTexto(document.getElementById("descripcion").value),
		    categoria: categoriaId ? { id: parseInt(categoriaId) } : null,
		    unidadMedida: sanitizarTexto(document.getElementById("unidad").value),
		    precioActual: parseFloat(document.getElementById("precioActual").value),
		    stockMinimo: parseFloat(document.getElementById("stockMinimo").value),
		    activo: document.getElementById("activo").value === "true"
		};

        let res;

        if (id) {
            res = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            res = await fetch(`/api/productos/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        let texto = await res.text();

        if (!res.ok) {
            console.error("Error backend:", texto);
            mostrarAlertaFormulario("No se pudo guardar el producto. Verifica los datos e inténtalo nuevamente.");
            mostrarToast("No se pudo guardar el producto.", "danger");
            return;
        }

		modalProducto.hide();
		await cargarProductosCrud();

		mostrarSuccessBanner(
		    id ? "Producto actualizado correctamente" : "Producto registrado correctamente",
		    id
		        ? "Los cambios del producto fueron guardados correctamente."
		        : "El nuevo producto ya forma parte del catálogo."
		);

		mostrarToast(
		    id ? "Producto actualizado correctamente." : "Producto registrado correctamente.",
		    "success"
		);

		resaltarPrimeraFilaProducto();

    } catch (error) {
        console.error("Error guardando producto:", error);
        mostrarAlertaFormulario("Ocurrió un problema inesperado al guardar.");
        mostrarToast("Ocurrió un error al guardar.", "danger");
    } finally {
        guardandoProducto = false;
        setGuardandoUI(false);
    }
}

function setGuardandoUI(guardando) {
    const btn = document.getElementById("btnGuardarProducto");
    if (!btn) return;

    btn.disabled = guardando;
    btn.innerHTML = guardando ? "Guardando..." : "Guardar";
}

async function toggleActivo(id, estadoActual) {
    const accion = estadoActual ? "desactivar" : "activar";

    if (!confirm(`¿Seguro que deseas ${accion} este producto?`)) return;

    await fetch(`/api/productos/${id}/toggle-activo`, {
        method: 'PATCH'
    });

    await cargarProductosCrud();
    mostrarToast(`Producto ${accion === "activar" ? "activado" : "desactivado"} correctamente.`, "success");
}

async function cargarCategorias() {
    let res = await fetch('/api/categorias');
    let data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
        console.error("Error cargando categorías:", data);
        mostrarToast("No se pudieron cargar las categorías.", "warning");
        return;
    }

    categoriasCrud = data;

    let select = document.getElementById("categoria");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione una categoría</option>`;

    data
        .filter(c => c.activo !== false)
        .forEach(c => {
            select.innerHTML += `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`;
        });
}

function sanitizarTexto(valor) {
    return (valor || "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizarTexto(valor) {
    return sanitizarTexto(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function actualizarBotonLimpiarBuscadorProducto() {
    const input = document.getElementById("buscadorProducto");
    const btn = document.getElementById("limpiarBuscadorProducto");

    if (!input || !btn) return;

    btn.classList.toggle("d-none", !input.value.trim());
}

function limpiarBuscadorProducto() {
    const input = document.getElementById("buscadorProducto");
    if (!input) return;

    input.value = "";
    filtrarProductos();
    actualizarBotonLimpiarBuscadorProducto();
    input.focus();
}

function mostrarToast(mensaje, tipo = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const id = "toast-" + Date.now();

    const bgClass = {
        success: "text-bg-success",
        danger: "text-bg-danger",
        warning: "text-bg-warning",
        info: "text-bg-primary"
    }[tipo] || "text-bg-success";

    container.innerHTML += `
        <div id="${id}" class="toast align-items-center ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(mensaje)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: 2600 });
    toast.show();

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function mostrarSuccessBanner(mensaje = "Producto guardado correctamente", detalle = "El registro se actualizó sin errores.") {
    const banner = document.getElementById("productoSuccessBanner");
    if (!banner) return;

    banner.innerHTML = `
        <div class="success-banner-content">
            <i class="bi bi-check-circle-fill"></i>
            <div>
                <div class="success-banner-title">${escapeHtml(mensaje)}</div>
                <div class="success-banner-text">${escapeHtml(detalle)}</div>
            </div>
        </div>
    `;

    banner.classList.remove("d-none");

    setTimeout(() => {
        banner.classList.add("d-none");
    }, 3200);
}

function resaltarPrimeraFilaProducto() {
    const fila = document.querySelector("#tablaProductosCrud tbody tr");
    if (!fila) return;

    fila.classList.add("table-success");

    setTimeout(() => {
        fila.classList.remove("table-success");
    }, 2200);
}