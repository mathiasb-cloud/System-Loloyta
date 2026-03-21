let productosCrud = [];
let modalProducto = null;
let categoriasCrud = [];

function initProductos() {
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    cargarCategorias();
    cargarProductosCrud();

    document.getElementById("buscadorProducto")
        ?.addEventListener("keyup", filtrarProductos);
}

async function cargarProductosCrud() {
    let res = await fetch('/api/productos');
    let data = await res.json();

    productosCrud = data;
    renderProductos(productosCrud);
}

function renderProductos(data) {
    let tbody = document.querySelector("#tablaProductosCrud tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria?.nombre || ""}</td>
                <td>${p.descripcion || ""}</td>
                <td>${p.unidadMedida || ""}</td>
                <td>${p.stockMinimo || 0}</td>
                <td>${p.activo ? "Sí" : "No"}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick='editarProducto(${JSON.stringify(p)})'>✏️</button>
                    <button 
                        class="btn btn-sm ${p.activo ? "btn-danger" : "btn-success"}"
                        onclick='toggleActivo(${p.id}, ${p.activo})'>
                        ${p.activo ? "Desactivar" : "Activar"}
                    </button>
                </td>
            </tr>
        `;
    });
}

function filtrarProductos() {
    let texto = document.getElementById("buscadorProducto").value.toLowerCase();

    let filtrados = productosCrud.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    renderProductos(filtrados);
}

function abrirModal() {
    document.getElementById("productoId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("unidad").value = "";
    document.getElementById("stockMinimo").value = "";
    document.getElementById("activo").value = "true";

    modalProducto.show();
}

function editarProducto(p) {
    document.getElementById("productoId").value = p.id;
    document.getElementById("nombre").value = p.nombre || "";
    document.getElementById("descripcion").value = p.descripcion || "";
    document.getElementById("categoria").value = p.categoria?.id || "";
    document.getElementById("unidad").value = p.unidadMedida || "";
    document.getElementById("stockMinimo").value = p.stockMinimo || "";
    document.getElementById("activo").value = String(p.activo);

    modalProducto.show();
}

async function guardarProducto() {
    let id = document.getElementById("productoId").value;
    let categoriaId = document.getElementById("categoria").value;

    let body = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        categoria: categoriaId ? { id: parseInt(categoriaId) } : null,
        unidadMedida: document.getElementById("unidad").value,
        stockMinimo: parseFloat(document.getElementById("stockMinimo").value) || 0,
        activo: document.getElementById("activo").value === "true"
    };

    if (id) {
        await fetch(`/api/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } else {
        await fetch(`/api/productos/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    modalProducto.hide();
    cargarProductosCrud();
}

async function toggleActivo(id, estadoActual) {
    let accion = estadoActual ? "desactivar" : "activar";

    if (!confirm(`¿Seguro que deseas ${accion} este producto?`)) return;

    await fetch(`/api/productos/${id}/toggle-activo`, {
        method: 'PATCH'
    });

    cargarProductosCrud();
}

async function cargarCategorias() {
    let res = await fetch('/api/categorias');
    let data = await res.json();

    categoriasCrud = data;

    let select = document.getElementById("categoria");
    if (!select) return;

    select.innerHTML = `<option value="">Seleccione una categoría</option>`;

    data.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}