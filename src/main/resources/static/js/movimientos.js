async function initMovimientos() {
    await cargarMovimientos();
}

async function cargarMovimientos() {
    let res = await fetch('/api/movimientos/resumen');
    let data = await res.json();

    let tbody = document.querySelector("#tablaMovimientos tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach((m, index) => {
        let fechaObj = new Date(m.fecha);

        let fecha = fechaObj.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        let hora = fechaObj.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let badgeClass = "bg-secondary";
        if (m.tipo === "INGRESO") badgeClass = "bg-success";
        if (m.tipo === "SALIDA") badgeClass = "bg-warning text-dark";
        if (m.tipo === "MERMA") badgeClass = "bg-danger";

        let row = document.createElement("tr");
        row.classList.add("fade-in-row");
        row.style.animationDelay = `${index * 0.05}s`;

        row.innerHTML = `
            <td>
                <span class="badge ${badgeClass} px-3 py-2">
                    ${m.tipo}
                </span>
            </td>

            <td>
                <div class="fw-semibold">${fecha}</div>
                <small class="text-muted">${hora}</small>
            </td>

            <td>
                <span class="fw-semibold">${m.totalItems}</span>
                <small class="text-muted"> productos</small>
            </td>

            <td>
                <button 
                    class="btn btn-sm btn-outline-primary"
                    onclick="verMovimiento('${m.referencia}')"
                >
                    <i class="bi bi-eye"></i> Ver
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function verMovimiento(referencia) {
    window.location.href = `/movimientos/detalle?ref=${encodeURIComponent(referencia)}`;
}