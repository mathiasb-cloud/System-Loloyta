function cargar(event, url, element = null) {
    if (event?.preventDefault) event.preventDefault();

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error al cargar la vista: ${res.status}`);
            }
            return res.text();
        })
        .then(html => {
            const contenido = document.getElementById("contenido");
            contenido.className = "main-card p-4 fade-in-soft";
            contenido.innerHTML = html;

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
				if (url.includes("almacenes") && typeof initAlmacenes === "function") initAlmacenes();
                if (url.includes("movimientos") && typeof initMovimientos === "function") initMovimientos();
				if (url.includes("locales") && typeof initLocales === "function") initLocales();
                if (url.includes("mermas") && typeof initMermas === "function") initMermas();
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
window.mostrarDashboard = mostrarDashboard;

document.addEventListener("DOMContentLoaded", () => {
    const vistaPendiente = sessionStorage.getItem("abrirVistaAlCargar");

    if (vistaPendiente) {
        sessionStorage.removeItem("abrirVistaAlCargar");
        const link = [...document.querySelectorAll(".nav-dashboard .nav-link")]
            .find(a => a.getAttribute("onclick")?.includes(vistaPendiente));

        cargar({ preventDefault() {} }, vistaPendiente, link || null);
        return;
    }

    if (typeof initDashboard === "function") {
        initDashboard();
    }
});