let salidaId = null;
let productosSalidaGlobal = [];

async function initSalidas() {
    await cargarAlmacenesSalida();
    await cargarLocalesSalida();
    await cargarProductosSalida();
	document.getElementById("almacenSalida")?.addEventListener("change", actualizarFlujoSalidaVisual);
	document.getElementById("localSalida")?.addEventListener("change", actualizarFlujoSalidaVisual);

	

    document.getElementById("buscadorSalida")
        ?.addEventListener("keyup", function() {

            let texto = this.value.toLowerCase();
            let resultadosDiv = document.getElementById("resultadosSalida");
            resultadosDiv.innerHTML = "";

            if (texto.length === 0) return;

            let filtrados = productosSalidaGlobal.filter(p =>
                p.nombre.toLowerCase().includes(texto)
            );

            filtrados.forEach(p => {
                let item = document.createElement("div");
                item.className = "list-group-item list-group-item-action";
                item.innerText = p.nombre;

                item.onclick = () => agregarProductoSalida(p);

                resultadosDiv.appendChild(item);
            });
        });
		
		actualizarEstadoBotonesSalida();
		actualizarFlujoSalidaVisual();
}

async function cargarAlmacenesSalida() {
    let res = await fetch('/api/almacenes');
    let data = await res.json();

    let select = document.getElementById("almacenSalida");
    if (!select) return;

    select.innerHTML = "";

    data.forEach(a => {
        select.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
    });
}

async function guardarOSobrescribirSalida() {
    if (!salidaId) {
        await crearSalida();
    } else {
        await guardarCambiosSalida();
    }
}

async function cargarLocalesSalida() {
    let res = await fetch('/api/locales');
    let data = await res.json();

    let select = document.getElementById("localSalida");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione un local</option>`;

    data.forEach(local => {
        select.innerHTML += `<option value="${local.id}">${local.nombre}</option>`;
    });
}

async function cargarProductosSalida() {
    let res = await fetch('/api/productos');
    let json = await res.json();

    productosSalidaGlobal = json.content || json || [];
}

function agregarProductoSalida(producto) {
    let tabla = document.querySelector("#tablaSalida tbody");
    let filas = tabla.querySelectorAll("tr");

    for (let i = 0; i < filas.length; i++) {
        if (filas[i].dataset.id == producto.id) return;
    }

    let fila = document.createElement("tr");
    fila.dataset.id = producto.id;

    fila.innerHTML = `
        <td>${producto.categoria?.nombre || "N/A"}</td>
        <td>${producto.nombre}</td>
        <td>${producto.unidadMedida || "N/A"}</td>
        <td><input type="number" class="form-control" value="1" min="1"></td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarFilaSalida(this)">X</button></td>
    `;

    tabla.appendChild(fila);
}

function eliminarFilaSalida(btn) {
    btn.parentElement.parentElement.remove();
}

async function crearSalida() {
    let almacenId = document.getElementById("almacenSalida").value;
    let localId = document.getElementById("localSalida").value;

    if (!almacenId) {
        alert("Seleccione un almacén");
        return;
    }

    if (!localId) {
        alert("Seleccione un local destino");
        return;
    }

    let filas = document.querySelectorAll("#tablaSalida tbody tr");
    if (filas.length === 0) {
        alert("Agregue al menos un producto a la salida");
        return;
    }

    let res = await fetch('/api/salidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            almacenes: { id: Number(almacenId) },
            locales: { id: Number(localId) },
            usuario: { id: 1 }
        })
    });

    if (!res.ok) {
        alert("No se pudo crear la salida");
        return;
    }

    let data = await res.json();
    salidaId = data.id;

    if (!salidaId) {
        alert("Error: no se creó la salida");
        return;
    }

    
    try {
        await guardarDetalleSalida();
    } catch (error) {
        
        await fetch(`/api/salidas/${salidaId}`, { method: 'DELETE' });
        salidaId = null;
        alert("Error al guardar los detalles, la salida fue eliminada.");
        return;
    }

    actualizarEstadoBotonesSalida();

    alert("Salida guardada correctamente");
}

async function guardarDetalleSalida() {
    let filas = document.querySelectorAll("#tablaSalida tbody tr");

    for (let i = 0; i < filas.length; i++) {
        let input = filas[i].querySelector("input");
        let cantidad = input.value;

        let res = await fetch('/api/detalle-salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                salida: { id: salidaId },
                producto: { id: Number(filas[i].dataset.id) },
                cantidadDespacho: Number(cantidad)
            })
        });

        if (!res.ok) {
            alert("No se pudo guardar un detalle de la salida");
            return;
        }

        console.log("DETALLE:", await res.json());
    }
}

async function confirmarSalida() {
    if (!salidaId) {
        alert("Primero guarda la salida");
        return;
    }

    let res = await fetch(`/api/salidas/${salidaId}/confirmar`, {
        method: 'PATCH'
    });

    if (!res.ok) {
        let mensaje = "No se pudo confirmar la salida";

        try {
            mensaje = await res.text();
        } catch (e) {}

        alert(mensaje);
        return;
    }

    let data = await res.json();
    console.log("CONFIRMAR:", data);

    alert("Salida confirmada");

	salidaId = null;  // Restablecer la salida
	actualizarEstadoBotonesSalida();  // Actualizar los botones visualmente
}

function actualizarEstadoBotonesSalida() {
    const btnGuardar = document.getElementById("btnGuardarSalida");
    const textoGuardar = document.getElementById("textoBtnGuardarSalida");
    const btnConfirmar = document.getElementById("btnConfirmarSalida");
    const btnCancelar = document.getElementById("btnCancelarSalida");

    const yaGuardada = !!salidaId;

    if (textoGuardar) {
        textoGuardar.textContent = yaGuardada ? "Guardar cambios" : "Guardar Salida";
    }

    if (btnConfirmar) {
        btnConfirmar.disabled = !yaGuardada;
    }

    if (btnCancelar) {
        btnCancelar.disabled = !yaGuardada;
    }
}



async function guardarCambiosSalida() {
    let almacenId = document.getElementById("almacenSalida").value;
    let localId = document.getElementById("localSalida").value;

    if (!almacenId) {
        alert("Seleccione un almacén");
        return;
    }

    if (!localId) {
        alert("Seleccione un local destino");
        return;
    }

    let filas = document.querySelectorAll("#tablaSalida tbody tr");
    if (filas.length === 0) {
        alert("Agregue al menos un producto a la salida");
        return;
    }

    let resSalida = await fetch(`/api/salidas/${salidaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            almacenes: { id: Number(almacenId) },
            locales: { id: Number(localId) },
            usuario: { id: 1 }
        })
    });

    if (!resSalida.ok) {
        alert("No se pudo actualizar la salida");
        return;
    }

    let resBorrarDetalle = await fetch(`/api/detalle-salida/salida/${salidaId}`, {
        method: 'DELETE'
    });

    if (!resBorrarDetalle.ok) {
        alert("No se pudo actualizar el detalle de la salida");
        return;
    }

    await guardarDetalleSalida();

    alert("Cambios guardados correctamente");
}


function confirmarCancelacionSalida() {
    if (!salidaId) {
        alert("No hay salida pendiente para cancelar");
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById("modalCancelarSalida"));
    modal.show();
}


async function cancelarSalidaPendiente() {
    if (!salidaId) {
        return;
    }

    let res = await fetch(`/api/salidas/${salidaId}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        alert("No se pudo cancelar la salida");
        return;
    }

    const modalEl = document.getElementById("modalCancelarSalida");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    limpiarFormularioSalida();

    alert("Salida pendiente cancelada");
}



function limpiarFormularioSalida() {
    salidaId = null;

    const tbody = document.querySelector("#tablaSalida tbody");
    if (tbody) {
        tbody.innerHTML = "";
    }

    const buscador = document.getElementById("buscadorSalida");
    if (buscador) {
        buscador.value = "";
    }

    const resultados = document.getElementById("resultadosSalida");
    if (resultados) {
        resultados.innerHTML = "";
    }

    
    const almacenSelect = document.getElementById("almacenSalida");
    if (almacenSelect) {
        almacenSelect.selectedIndex = 0;  
    }

    const localSelect = document.getElementById("localSalida");
    if (localSelect) {
        localSelect.selectedIndex = 0;  
    }

    actualizarEstadoBotonesSalida();
}







function actualizarFlujoSalidaVisual() {
    const almacenSelect = document.getElementById("almacenSalida");
    const localSelect = document.getElementById("localSalida");

    const flujoAlmacenNombre = document.getElementById("flujoAlmacenNombre");
    const flujoLocalNombre = document.getElementById("flujoLocalNombre");
    const estadoSalidaBox = document.getElementById("estadoSalidaBox");

    const nombreAlmacen = almacenSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione almacén";
    const nombreLocal = localSelect?.selectedOptions?.[0]?.text?.trim() || "Seleccione local";

    if (flujoAlmacenNombre) {
        flujoAlmacenNombre.textContent = nombreAlmacen;
    }

    if (flujoLocalNombre) {
        flujoLocalNombre.textContent = nombreLocal;
    }

    if (estadoSalidaBox) {
        const almacenValido = almacenSelect?.value;
        const localValido = localSelect?.value;

        if (almacenValido && localValido) {
            estadoSalidaBox.innerHTML = `
                <span class="badge text-bg-light border text-success">
                    <i class="bi bi-arrow-left-right me-1"></i>
                    Flujo configurado
                </span>
                <span class="ms-2">Se enviará desde <strong>${escapeHtml(nombreAlmacen)}</strong> hacia <strong>${escapeHtml(nombreLocal)}</strong>.</span>
            `;
        } else if (almacenValido || localValido) {
            estadoSalidaBox.innerHTML = `
                <span class="badge text-bg-light border text-warning">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Flujo incompleto
                </span>
                <span class="ms-2">Completa origen y destino para continuar.</span>
            `;
        } else {
            estadoSalidaBox.innerHTML = `
                <span class="text-muted">Selecciona el almacén de origen y el local de destino.</span>
            `;
        }
    }
}