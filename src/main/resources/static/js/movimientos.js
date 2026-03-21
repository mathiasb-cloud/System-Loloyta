async function initMovimientos() {
        await cargarMovimientos();
    }

    async function cargarMovimientos() {
        let res = await fetch('/api/movimientos/resumen');
        let data = await res.json();

        let tbody = document.querySelector("#tablaMovimientos tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        data.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td>${m.tipo}</td>
                    <td>${m.fecha}</td>
                    <td>${m.totalItems} productos</td>
                </tr>
            `;
        });
    }