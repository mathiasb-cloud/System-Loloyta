async function initOrdenes() {
        await cargarAlmacenes();
        await cargarProductos();

        document.getElementById("buscador")
            ?.addEventListener("keyup", function() {
                let texto = this.value.toLowerCase();
                let resultadosDiv = document.getElementById("resultados");
                resultadosDiv.innerHTML = "";

                if (texto.length === 0) return;

                let filtrados = productosGlobal.filter(p =>
                    p.nombre.toLowerCase().includes(texto)
                );

                filtrados.forEach(p => {
                    let item = document.createElement("div");
                    item.innerText = p.nombre;
                    item.style.cursor = "pointer";
                    item.onclick = () => agregarProductoTabla(p);
                    resultadosDiv.appendChild(item);
                });
            });
    }

    async function cargarAlmacenes() {
        let res = await fetch('/api/almacenes');
        let data = await res.json();

        let select = document.getElementById("almacenSelect");
        if (!select) return;

        select.innerHTML = "";

        data.forEach(a => {
            select.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
        });
    }

    async function cargarProductos() {
        let res = await fetch('/api/productos');
        let json = await res.json();

        productosGlobal = json.content || json || [];
    }

    function agregarProductoTabla(producto) {
        let tabla = document.getElementById("tablaProductos");
        if (!tabla) return;

        let filas = tabla.querySelectorAll("tr");

        for (let i = 1; i < filas.length; i++) {
            if (filas[i].children[0].innerText === producto.nombre) return;
        }

        let fila = tabla.insertRow();

        fila.innerHTML = `
            <td data-id="${producto.id}">${producto.nombre}</td>
            <td><input type="number" value="1"></td>
            <td><input type="number" value="0"></td>
            <td><button onclick="eliminarFila(this)">X</button></td>
        `;
    }

    function eliminarFila(btn) {
        btn.parentElement.parentElement.remove();
    }

    async function crearOrden() {
        let res = await fetch('/api/ordenes-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metodoPago: document.getElementById("metodoPago").value,
                estado: "PENDIENTE",
                almacenes: { id: document.getElementById("almacenSelect").value },
                usuario: { id: 1 }
            })
        });

        let data = await res.json();
        ordenId = data.id;

        alert("Orden creada");
        await guardarDetalles();
    }

    async function guardarDetalles() {
        let filas = document.querySelectorAll("#tablaProductos tr");

        for (let i = 1; i < filas.length; i++) {
            let celdas = filas[i].querySelectorAll("td");
            let inputs = filas[i].querySelectorAll("input");

            await fetch('/api/detalle-orden-compra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ordenCompra: { id: ordenId },
                    producto: { id: celdas[0].dataset.id },
                    cantidad: inputs[0].value,
                    precioUnitario: inputs[1].value
                })
            });
        }

        alert("Productos guardados");
    }

    async function confirmarOrden() {
        await fetch(`/api/ordenes-compra/${ordenId}/estado?estado=CONFIRMADA`, {
            method: 'PATCH'
        });

        alert("Orden confirmada");
    }