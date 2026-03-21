let salidaId = null;
	let productosSalidaGlobal = [];

	async function initSalidas() {
	    await cargarAlmacenesSalida();
	    await cargarProductosSalida();

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
	        <td><input type="number" class="form-control" value="1"></td>
	        <td><button class="btn btn-sm btn-danger" onclick="eliminarFilaSalida(this)">X</button></td>
	    `;

	    tabla.appendChild(fila);
	}

	function eliminarFilaSalida(btn) {
	    btn.parentElement.parentElement.remove();
	}

	async function crearSalida() {

	    let res = await fetch('/api/salidas', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({
	            almacenes: { id: document.getElementById("almacenSalida").value },
	            usuario: { id: 1 }
	        })
	    });

	    let data = await res.json();

	    console.log("SALIDA CREADA:", data);

	    salidaId = data.id;

	    if (!salidaId) {
	        alert("Error: no se creó la salida");
	        return;
	    }

	    await guardarDetalleSalida();
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
	                producto: { id: filas[i].dataset.id },
	                cantidadDespacho: cantidad
	            })
	        });

	        console.log("DETALLE:", await res.json());
	    }

	    alert("Detalle guardado");
	}

	async function confirmarSalida() {

	    if (!salidaId) {
	        alert("Primero guarda la salida");
	        return;
	    }

	    let res = await fetch(`/api/salidas/${salidaId}/confirmar`, {
	        method: 'PATCH'
	    });

	    let data = await res.json();

	    console.log("CONFIRMAR:", data);

	    alert("Salida confirmada");
	}