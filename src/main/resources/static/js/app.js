function cargar(event, url) {
    event.preventDefault();

    fetch(url)
        .then(res => res.text())
        .then(html => {
            document.getElementById("contenido").innerHTML = html;

            setTimeout(() => {
                if (url.includes("stock") && typeof initStock === "function") initStock();
                if (url.includes("productos") && typeof initProductos === "function") initProductos();
                if (url.includes("ordenes") && typeof initOrdenes === "function") initOrdenes();
                if (url.includes("salidas") && typeof initSalidas === "function") initSalidas();
                if (url.includes("movimientos") && typeof initMovimientos === "function") initMovimientos();
            }, 100);
        });
}window.cargar = cargar;