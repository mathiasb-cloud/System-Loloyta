function cargar(event, url, element = null) {
    event.preventDefault();

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error al cargar la vista: ${res.status}`);
            }
            return res.text();
        })
        .then(html => {
            document.getElementById("contenido").innerHTML = html;

            document.querySelectorAll(".nav-dashboard .nav-link").forEach(link => {
                link.classList.remove("active");
            });

            if (element) {
                element.classList.add("active");
            }

            setTimeout(() => {
                if (url.includes("stock") && typeof initStock === "function") initStock();
                if (url.includes("productos") && typeof initProductos === "function") initProductos();
                if (url.includes("ordenes") && typeof initOrdenes === "function") initOrdenes();
                if (url.includes("salidas") && typeof initSalidas === "function") initSalidas();
				if (url.includes("mermas") && typeof initMermas === "function") initMermas();
                if (url.includes("movimientos") && typeof initMovimientos === "function") initMovimientos();
            }, 100);
        })
        .catch(error => {
            console.error("Error cargando vista:", error);
            document.getElementById("contenido").innerHTML = `
                <div class="alert alert-danger mb-0">
                    No se pudo cargar la vista.
                </div>
            `;
        });
}

window.cargar = cargar;