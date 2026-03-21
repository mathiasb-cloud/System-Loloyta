function initStock() {
        console.log("INIT STOCK");

        cargarStock();
        cargarAlmacenesStock();

        document.getElementById("buscadorStock")
            ?.addEventListener("keyup", filtrarStock);

        document.getElementById("filtroAlmacen")
            ?.addEventListener("change", filtrarStock);
    }

    async function cargarStock() {
        let res = await fetch('/api/stock');
        let data = await res.json();

        stockGlobal = data;
        renderStock(data);
    }

    function renderStock(data) {
        let tbody = document.querySelector("#tablaStock tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        data.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.producto?.nombre || "N/A"}</td>
                    <td>${s.almacenes?.nombre || "N/A"}</td>
                    <td>${s.cantidad ?? 0}</td>
                </tr>
            `;
        });
    }

    async function cargarAlmacenesStock() {
        let res = await fetch('/api/almacenes');
        let data = await res.json();

        let select = document.getElementById("filtroAlmacen");
        if (!select) return;

        select.innerHTML = `<option value="">Todos</option>`;

        data.forEach(a => {
            select.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
        });
    }

    function filtrarStock() {
        let texto = document.getElementById("buscadorStock")?.value.toLowerCase() || "";
        let almacenId = document.getElementById("filtroAlmacen")?.value;

        let filtrados = stockGlobal.filter(s => {
            let nombre = s.producto?.nombre?.toLowerCase() || "";
            let coincideNombre = nombre.includes(texto);
            let coincideAlmacen = !almacenId || s.almacenes?.id == almacenId;

            return coincideNombre && coincideAlmacen;
        });

        renderStock(filtrados);
    }
