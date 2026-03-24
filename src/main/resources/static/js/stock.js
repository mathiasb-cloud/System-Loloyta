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
	        const stockMinimo = Number(s.producto?.stockMinimo ?? 0);
	        const cantidad = Number(s.cantidad ?? 0);
	        const estado = obtenerEstadoStock(cantidad, stockMinimo);

	        tbody.innerHTML += `
	            <tr class="${estado.rowClass}">
	                <td>${s.producto?.id ?? "N/A"}</td>
	                <td>${s.producto?.nombre || "N/A"}</td>
	                <td>${s.producto?.descripcion || "-"}</td>
	                <td>${s.producto?.unidadMedida || "-"}</td>
	                <td>${stockMinimo}</td>
	                <td>${s.almacenes?.nombre || "N/A"}</td>
	                <td>
	                    <span class="stock-badge ${estado.badgeClass}">
	                        <i class="${estado.icon} me-2"></i>
	                        ${cantidad}
	                    </span>
	                </td>
	            </tr>
	        `;
	    });
	}
	
	
	
	function obtenerEstadoStock(cantidad, stockMinimo) {
	    const cant = Number(cantidad ?? 0);
	    const min = Number(stockMinimo ?? 0);

	    if (cant < min) {
	        return {
	            badgeClass: "stock-badge-low",
	            rowClass: "stock-row-low",
	            icon: "bi bi-exclamation-triangle-fill",
	            texto: cant
	        };
	    }

	    if (cant === min) {
	        return {
	            badgeClass: "stock-badge-min",
	            rowClass: "stock-row-min",
	            icon: "bi bi-exclamation-circle-fill",
	            texto: cant
	        };
	    }

	    return {
	        badgeClass: "stock-badge-ok",
	        rowClass: "",
	        icon: "bi bi-check-circle-fill",
	        texto: cant
	    };
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
