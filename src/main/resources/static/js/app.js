let chartMovimientosTipo = null;
let chartMermasCosto = null;

const permisosPorRuta = {
    "/productos": "PRODUCTOS_VER",
    "/ordenes": "ORDENES_VER",
    "/salidas": "SALIDAS_VER",
    "/mermas": "MERMAS_VER",
	"/proveedores": "PROVEEDORES_VER",
    "/stock": "STOCK_VER",
    "/movimientos": "MOVIMIENTOS_VER",
    "/almacenes": "ALMACENES_VER",
    "/locales": "LOCALES_VER",
    "/usuarios": "USUARIOS_VER",
    "/roles": "ROLES_VER"
};

async function mostrarNotificacionesStock() {
    try {
        const response = await fetch('/api/stock/stock-bajo');
        if (!response.ok) throw new Error('Error al obtener stock bajo');

        const stocks = await response.json();

        if (!stocks || stocks.length === 0) {
            Swal.fire({
                title: 'Sin alertas',
                text: 'No hay productos con stock bajo.',
                icon: 'info',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        let contenidoHtml = '<div style="max-height: 350px; overflow-y: auto;">';

        stocks.forEach(stock => {
            const producto = stock.producto || {};
            const almacen = stock.almacenes || {};
            const cantidad = stock.cantidad || 0;
            const stockMinimo = producto.stockMinimo || 0;
            const productoId = producto.id || '';
            const almacenId = almacen.id || '';

            contenidoHtml += `
                <div class="stock-card" 
                     data-producto-id="${productoId}" 
                     data-almacen-id="${almacenId}"
                     style="
                        border: 1px solid #fee2e2;
                        background: #fef2f2;
                        padding: 12px;
                        margin-bottom: 10px;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: transform 0.15s, box-shadow 0.15s;
                     "
                     onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.1)'"
                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
                >
                    <div style="font-weight: 600; font-size: 14px; color: #991b1b;">
                        ${escapeHtml(producto.nombre || 'N/A')}
                    </div>

                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        📦 ${escapeHtml(almacen.nombre || 'N/A')}
                    </div>

                    <div style="margin-top: 6px; display: flex; justify-content: space-between; font-size: 13px;">
                        <span style="color: #dc2626; font-weight: bold;">
                            Stock: ${cantidad}
                        </span>
                        <span style="color: #374151;">
                            Mín: ${stockMinimo}
                        </span>
                    </div>
                </div>
            `;
        });

        contenidoHtml += '</div>';
        contenidoHtml += `
            <div style="margin-top: 10px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                Haz clic en una notificación para registrar ingreso
            </div>
        `;

        Swal.fire({
            title: `⚠️ Stock Bajo (${stocks.length})`,
            html: contenidoHtml,
            icon: 'warning',
            width: '420px',
            confirmButtonText: 'Cerrar',
            didOpen: () => {
                document.querySelectorAll('.stock-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const productoId = card.getAttribute('data-producto-id');
                        if (productoId) {
                            sessionStorage.setItem('productoParaIngreso', productoId);
                            Swal.close();
                            cargar({ preventDefault() {} }, '/ordenes');
                        }
                    });
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las alertas de stock.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Funcion para actualizar el badge de notificaciones
async function actualizarBadgeNotificaciones() {
    try {
        const response = await fetch('/api/stock/stock-bajo');
        if (!response.ok) {
            console.warn('Badge: respuesta no ok', response.status);
            return;
        }

        const stocks = await response.json();
        const badge = document.getElementById('notificationBadge');

        if (badge) {
            if (stocks && stocks.length > 0) {
                badge.textContent = stocks.length > 99 ? '99+' : stocks.length;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error actualizando badge:', error);
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.style.display = 'none';
    }
}

function cargar(event, url, element = null) {
	
	if (permisosPorRuta[url] && !tienePermiso(permisosPorRuta[url])) {
	    Swal.fire({
	        title: "Acceso restringido",
	        text: "No tiene permisos para acceder a esta sección.",
	        icon: "warning",
	        confirmButtonText: "Entendido"
	    });
	    return;
	}
	contenido.className = "fade-in-soft";
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
			document.body.classList.remove("dashboard-mode");

			if (url === "/index" || url.includes("index")) {
			    document.body.classList.add("dashboard-mode");
			}
            contenido.className = "fade-in-soft";
            contenido.innerHTML = html;

            document.querySelectorAll(".topbar-nav-link").forEach(link => {
                link.classList.remove("active");
            });

            if (element) {
                element.classList.add("active");
            }

            setTimeout(() => {
                if (url.includes("stock-auditoria") && typeof initStockAuditoria === "function") initStockAuditoria();
                else if (url.includes("stock") && typeof initStock === "function") initStock();

                if (url.includes("productos") && typeof initProductos === "function") initProductos();
                if (url.includes("ordenes") && typeof initOrdenes === "function") initOrdenes();
                if (url.includes("salidas") && typeof initSalidas === "function") initSalidas();
                if (url.includes("almacenes") && typeof initAlmacenes === "function") initAlmacenes();
                if (url.includes("movimientos") && typeof initMovimientos === "function") initMovimientos();
                if (url.includes("locales") && typeof initLocales === "function") initLocales();
                if (url.includes("mermas") && typeof initMermas === "function") initMermas();
                if (url.includes("proveedores") && typeof initProveedores === "function") initProveedores();
				if (url.includes("roles") && typeof initRoles === "function") initRoles();
				if (url.includes("usuarios") && typeof initUsuarios === "function") initUsuarios();
				if (url.includes("stock-auditoria") && typeof initStockAuditoria === "function") initStockAuditoria();
				
				aplicarPermisosEnVista();
				aplicarDatosUsuarioEnUI();

                
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


function irResumen(event, element = null) {
	document.body.classList.add("dashboard-mode");
    if (event?.preventDefault) event.preventDefault();

    document.querySelectorAll(".topbar-nav-link").forEach(link => {
        link.classList.remove("active");
    });

    if (element) {
        element.classList.add("active");
    }

    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.className = "dashboard-riotter-root fade-in-soft";
    contenido.innerHTML = `
        <section class="dashboard-riotter-hero reveal-on-scroll reveal-visible">
            <div class="dashboard-riotter-hero__left">
                <h1 class="dashboard-riotter-title">
                    Bienvenido, <span id="dashboardNombreUsuario">Usuario</span>
                </h1>
                <p class="dashboard-riotter-subtitle">
                    Supervisa inventario, movimientos, mermas y operación diaria desde una sola vista.
                </p>

                <div class="dashboard-riotter-actions">
                    <button class="btn btn-riotter-dark" onclick="cargar(event, '/ordenes')">
                        <i class="bi bi-plus-circle me-2"></i>Nuevo ingreso
                    </button>
                    <button class="btn btn-riotter-light" onclick="cargar(event, '/salidas')">
                        <i class="bi bi-box-arrow-right me-2"></i>Nueva salida
                    </button>
                </div>

                <div class="dashboard-important-actions">
                    <div class="dashboard-important-label">Acciones importantes</div>
                    <div class="dashboard-important-grid">
                        <div class="dashboard-important-card">
                            <div class="dashboard-important-icon soft-red">
                                <i class="bi bi-exclamation-circle"></i>
                            </div>
                            <div>
                                <div class="dashboard-important-title">Stock crítico</div>
                                <div id="importantStockCritico" class="dashboard-important-meta">0 productos en alerta</div>
                            </div>
                        </div>

                        <div class="dashboard-important-card">
                            <div class="dashboard-important-icon soft-gold">
                                <i class="bi bi-trash3"></i>
                            </div>
                            <div>
                                <div class="dashboard-important-title">Mermas confirmadas</div>
                                <div id="importantMermas" class="dashboard-important-meta">0 registradas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-riotter-hero__right">
                <button class="btn btn-riotter-profile">Vista operativa</button>
            </div>
        </section>

        <section class="dashboard-block reveal-on-scroll">
            <div class="dashboard-block__header">
                <div class="dashboard-block__title">Resumen de operación</div>
                <div class="dashboard-block__tools">
                    <span class="dashboard-tool-chip">Tiempo real</span>
                </div>
            </div>

            <div class="dashboard-table-head dashboard-table-head--summary">
                <span>Indicador</span>
                <span>Valor</span>
                <span>Detalle</span>
            </div>

            <div id="dashboardResumenGeneral"></div>
        </section>

        <section class="dashboard-block reveal-on-scroll">
            <div class="dashboard-block__header">
                <div class="dashboard-block__title">Análisis del sistema</div>
                <div class="dashboard-block__tools">
                    <span class="dashboard-tool-chip">Indicadores</span>
                </div>
            </div>

            <div class="dashboard-analytics-grid">
                <div class="dashboard-analytics-card">
                    <div class="dashboard-analytics-card__title">Movimiento por tipo</div>
                    <div class="dashboard-analytics-card__metric" id="totalMovimientosMetric">0</div>
                    <div class="dashboard-analytics-card__meta" id="totalMovimientosMeta">Sin movimientos</div>
                    <div class="chart-container-riotter">
                        <canvas id="chartMovimientosTipo"></canvas>
                    </div>
                </div>

                <div class="dashboard-analytics-card">
                    <div class="dashboard-analytics-card__title">Costo estimado de merma</div>
                    <div class="dashboard-analytics-card__metric" id="costoMermaMetric">S/ 0.00</div>
                    <div class="dashboard-analytics-card__meta" id="costoMermaMeta">Sin impacto registrado</div>
                    <div class="chart-container-riotter">
                        <canvas id="chartMermasCosto"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <section class="dashboard-block reveal-on-scroll">
            <div class="dashboard-block__header">
                <div class="dashboard-block__title">Actividad reciente</div>
                <div class="dashboard-block__tools">
                    <span class="dashboard-tool-chip">Movimientos</span>
                </div>
            </div>

            <div class="dashboard-table-head">
                <span>Tipo</span>
                <span>Producto</span>
                <span>Almacén</span>
                <span>Fecha</span>
            </div>

            <div id="dashboardMovimientosTabla"></div>
        </section>

        <section class="dashboard-block reveal-on-scroll">
            <div class="dashboard-block__header">
                <div class="dashboard-block__title">Stock y catálogos</div>
                <div class="dashboard-block__tools">
                    <span class="dashboard-tool-chip">Inventario</span>
                </div>
            </div>

            <div class="dashboard-bottom-grid-riotter">
                <div class="dashboard-mini-panel">
                    <div class="dashboard-mini-panel__title">Stock crítico</div>
                    <div id="dashboardAlertasStockMini"></div>
                </div>

                <div class="dashboard-mini-panel">
                    <div class="dashboard-mini-panel__title">Almacenes y locales</div>
                    <div id="dashboardInfraestructuraMini"></div>
                </div>
            </div>
        </section>
    `;

    if (typeof initDashboardHome === "function") {
        initDashboardHome();
    }
	aplicarPermisosEnVista();
}
window.irResumen = irResumen;

window.cargar = cargar;

async function cargarSesionActual() {
    try {
        const res = await fetch("/api/auth/me", {
            credentials: "include"
        });

        if (!res.ok) {
            sessionStorage.removeItem("sesionUsuario");
            return null;
        }

        const data = await res.json();

        sessionStorage.setItem("sesionUsuario", JSON.stringify(data));

        return data;

    } catch (error) {
        console.error("Error obteniendo sesión:", error);
        sessionStorage.removeItem("sesionUsuario");
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarSesionActual();
    aplicarPermisosEnTopbar();
	aplicarDatosUsuarioEnUI();
    actualizarBadgeNotificaciones();

    const vistaPendiente = sessionStorage.getItem("abrirVistaAlCargar");

    if (vistaPendiente) {
        sessionStorage.removeItem("abrirVistaAlCargar");

        const link = [...document.querySelectorAll(".topbar-nav-link")]
            .find(a => a.getAttribute("onclick")?.includes(vistaPendiente));

        cargar({ preventDefault() {} }, vistaPendiente, link || null);
        return;
    }
	
	aplicarPermisosEnVista();

    if (typeof initDashboardHome === "function") {
        initDashboardHome();
    }
});

async function initDashboardHome() {
	
	aplicarDatosUsuarioEnUI();
    activarRevealOnScroll();

    try {
		const [
		    resProductos,
		    resStock,
		    resMermas,
		    resMovimientos,
		    resAlmacenes,
		    resLocales,
		    resOrdenes,
		    resSalidas,
		    resResumenMermas
		] = await Promise.all([
		    fetch("/api/productos"),
		    fetch("/api/stock"),
		    fetch("/api/mermas"),
		    fetch("/api/movimientos"),
		    fetch("/api/almacenes"),
		    fetch("/api/locales"),
		    fetch("/api/ordenes"),
		    fetch("/api/salidas"),
		    fetch("/api/mermas/resumen-dashboard")
		]);

        const productosRaw = resProductos.ok ? await resProductos.json() : [];
        const productos = productosRaw.content || productosRaw || [];
        const stock = resStock.ok ? await resStock.json() : [];
        const mermas = resMermas.ok ? await resMermas.json() : [];
        const movimientos = resMovimientos.ok ? await resMovimientos.json() : [];
        const almacenes = resAlmacenes.ok ? await resAlmacenes.json() : [];
        const locales = resLocales.ok ? await resLocales.json() : [];
        const ordenes = resOrdenes.ok ? await resOrdenes.json() : [];
        const salidas = resSalidas.ok ? await resSalidas.json() : [];
		const resumenMermas = resResumenMermas.ok ? await resResumenMermas.json() : {};

        const data = {
            productos,
            stock,
            mermas,
            movimientos,
            almacenes,
            locales,
            ordenes,
            salidas,
			resumenMermas
        };

        renderDashboardHero(data);
        renderDashboardResumenGeneral(data);
        renderDashboardMovimientos(data.movimientos);
        renderDashboardStockMini(data.stock);
        renderDashboardInfraestructura(data.almacenes, data.locales);
        renderDashboardCharts(data);

    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

function renderDashboardHero(data) {
    const stockCritico = data.stock.filter(s =>
        Number(s.cantidad || 0) <= Number(s.producto?.stockMinimo || 0)
    );
    const mermasConfirmadas = data.mermas.filter(m => m.estado === "CONFIRMADA");

    setText("importantStockCritico", `${stockCritico.length} productos en alerta`);
    setText("importantMermas", `${mermasConfirmadas.length} registradas`);
}

function renderDashboardResumenGeneral(data) {
    const box = document.getElementById("dashboardResumenGeneral");
    if (!box) return;

    const productosActivos = data.productos.filter(p => p.activo !== false).length;
    const almacenesActivos = data.almacenes.filter(a => a.activo !== false).length;
    const localesActivos = data.locales.filter(l => l.activo !== false).length;
    const costoMerma = Number(data.resumenMermas?.costoTotalMerma || 0);

    const filas = [
        {
            titulo: "Productos activos",
            valor: String(productosActivos),
            detalle: "Catálogo vigente del sistema",
            clase: "dashboard-pill-soft--success"
        },
        {
            titulo: "Almacenes operativos",
            valor: String(almacenesActivos),
            detalle: `${localesActivos} locales activos relacionados`,
            clase: "dashboard-pill-soft--success"
        },
        {
            titulo: "Costo estimado de merma",
            valor: formatearMonedaDash(costoMerma),
            detalle: "Impacto económico acumulado",
            clase: costoMerma > 0 ? "dashboard-pill-soft--warning" : "dashboard-pill-soft--success"
        }
    ];

    box.innerHTML = filas.map(f => `
        <div class="dashboard-row dashboard-row--summary">
            <div class="dashboard-cell-main">${escapeHtml(f.titulo)}</div>
            <div>
                <span class="dashboard-pill-soft ${f.clase}">
                    ${escapeHtml(f.valor)}
                </span>
            </div>
            <div class="dashboard-cell-sub">${escapeHtml(f.detalle)}</div>
        </div>
    `).join("");
}

function renderDashboardMovimientos(movimientos) {
    const box = document.getElementById("dashboardMovimientosTabla");
    if (!box) return;

    const data = [...movimientos]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 6);

    if (!data.length) {
        box.innerHTML = `<div class="dashboard-empty-row">No hay movimientos registrados.</div>`;
        return;
    }

    box.innerHTML = data.map(m => `
        <div class="dashboard-row dashboard-row--activity">
            <div class="dashboard-cell-main">${escapeHtml(m.tipo || "-")}</div>
            <div class="dashboard-cell-sub">${escapeHtml(m.producto?.nombre || "-")}</div>
            <div class="dashboard-cell-sub">${escapeHtml(m.almacen?.nombre || "-")}</div>
            <div class="dashboard-cell-sub">${formatearFechaDash(m.fecha)}</div>
        </div>
    `).join("");
}

function renderDashboardStockMini(stock) {
    const box = document.getElementById("dashboardAlertasStockMini");
    if (!box) return;

    const alertas = stock
        .filter(s => Number(s.cantidad || 0) <= Number(s.producto?.stockMinimo || 0))
        .slice(0, 5);

    if (!alertas.length) {
        box.innerHTML = `<div class="dashboard-empty-row">No hay alertas críticas.</div>`;
        return;
    }

    box.innerHTML = alertas.map(s => {
        const cantidad = Number(s.cantidad || 0);
        const minimo = Number(s.producto?.stockMinimo || 0);
        const clase = cantidad === 0 ? "dashboard-pill-soft--danger" : "dashboard-pill-soft--warning";
        const texto = cantidad === 0 ? "Sin stock" : "Bajo mínimo";

        return `
            <div class="dashboard-mini-item">
                <div class="dashboard-mini-item__left">
                    <div class="dashboard-mini-item__title">${escapeHtml(s.producto?.nombre || "-")}</div>
                    <div class="dashboard-mini-item__meta">
                        ${escapeHtml(s.almacenes?.nombre || "-")} · Stock ${cantidad} / Min ${minimo}
                    </div>
                </div>
                <span class="dashboard-pill-soft ${clase}">${texto}</span>
            </div>
        `;
    }).join("");
}

function renderDashboardInfraestructura(almacenes, locales) {
    const box = document.getElementById("dashboardInfraestructuraMini");
    if (!box) return;

    const html = [];

    [...almacenes].slice(0, 3).forEach(a => {
        html.push(`
            <div class="dashboard-mini-item">
                <div class="dashboard-mini-item__left">
                    <div class="dashboard-mini-item__title">${escapeHtml(a.nombre || "-")}</div>
                    <div class="dashboard-mini-item__meta">${escapeHtml(a.ubicacion || "Sin ubicación")}</div>
                </div>
                <span class="dashboard-pill-soft ${a.activo !== false ? "dashboard-pill-soft--success" : "dashboard-pill-soft--warning"}">
                    ${a.activo !== false ? "Activo" : "Inactivo"}
                </span>
            </div>
        `);
    });

    [...locales].slice(0, 3).forEach(l => {
        html.push(`
            <div class="dashboard-mini-item">
                <div class="dashboard-mini-item__left">
                    <div class="dashboard-mini-item__title">${escapeHtml(l.nombre || "-")}</div>
                    <div class="dashboard-mini-item__meta">${escapeHtml(l.ubicacion || "Sin ubicación")}</div>
                </div>
                <span class="dashboard-pill-soft ${l.activo !== false ? "dashboard-pill-soft--success" : "dashboard-pill-soft--warning"}">
                    ${l.activo !== false ? "Activo" : "Inactivo"}
                </span>
            </div>
        `);
    });

    box.innerHTML = html.join("") || `<div class="dashboard-empty-row">Sin infraestructura registrada.</div>`;
}

function renderDashboardCharts(data) {
    renderChartMovimientosTipo(data.movimientos);
    renderChartMermasCosto(data.mermas, data.resumenMermas);
}
function renderChartMovimientosTipo(movimientos) {
    const canvas = document.getElementById("chartMovimientosTipo");
    if (!canvas || typeof Chart === "undefined") return;

    const total = Array.isArray(movimientos) ? movimientos.length : 0;
    const ingresos = (movimientos || []).filter(m => (m.tipo || "").toUpperCase() === "INGRESO").length;
    const salidas = (movimientos || []).filter(m => (m.tipo || "").toUpperCase() === "SALIDA").length;
    const mermas = (movimientos || []).filter(m => (m.tipo || "").toUpperCase() === "MERMA").length;

    const card = canvas.closest(".dashboard-analytics-card");
    if (card) {
        const metricEl = card.querySelector(".dashboard-analytics-card__metric");
        const metaEl = card.querySelector(".dashboard-analytics-card__meta");

        if (metricEl) {
            metricEl.textContent = String(total);
        }

        if (metaEl) {
            metaEl.textContent = `${ingresos} ingresos · ${salidas} salidas · ${mermas} mermas`;
        }
    }

    if (chartMovimientosTipo) chartMovimientosTipo.destroy();

    chartMovimientosTipo = new Chart(canvas, {
        type: "line",
        data: {
            labels: ["Ingresos", "Salidas", "Mermas"],
            datasets: [{
                data: [ingresos, salidas, mermas],
                borderColor: "#8f2e2a",
                backgroundColor: "rgba(143, 46, 42, 0.08)",
                fill: true,
                tension: 0.42,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: chartOptionsMinimal()
    });
}

function renderChartMermasCosto(mermas, resumenMermas) {
    const canvas = document.getElementById("chartMermasCosto");
    if (!canvas || typeof Chart === "undefined") return;

    const data = [...mermas]
        .filter(m => (m.estado || "").toUpperCase() === "CONFIRMADA")
        .slice(-6);

    const total = Number(resumenMermas?.costoTotalMerma || 0);
    const cantidad = data.length;
    const labels = data.map((_, i) => `M${i + 1}`);
    const valores = cantidad > 0
        ? data.map(() => total / cantidad)
        : [0, 0, 0];

    setText("costoMermaMetric", formatearMonedaDash(total));
    setText(
        "costoMermaMeta",
        cantidad > 0
            ? `${cantidad} mermas confirmadas analizadas`
            : "Sin impacto registrado"
    );

    if (chartMermasCosto) chartMermasCosto.destroy();

    chartMermasCosto = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels.length ? labels : ["M1", "M2", "M3"],
            datasets: [{
                data: valores,
                borderColor: "#c96b47",
                backgroundColor: "rgba(201, 107, 71, 0.08)",
                fill: true,
                tension: 0.44,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: chartOptionsMinimal()
    });
}

function aplicarPermisosEnTopbar() {
    document.querySelectorAll(".topbar-nav-link[data-permiso]").forEach(link => {
        const permiso = link.dataset.permiso;
        link.style.display = tienePermiso(permiso) ? "" : "none";
    });

    const topbarMenu = document.getElementById("topbarMenu");
    if (topbarMenu) {
        topbarMenu.style.visibility = "visible";
    }
}

function chartOptionsMinimal() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                display: false,
                grid: { display: false },
                beginAtZero: true
            }
        }
    };
}

function activarRevealOnScroll() {
    const items = document.querySelectorAll(".reveal-on-scroll");
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
            }
        });
    }, {
        threshold: 0.12
    });

    items.forEach(item => observer.observe(item));
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatearMonedaDash(valor) {
    return Number(valor || 0).toLocaleString("es-PE", {
        style: "currency",
        currency: "PEN"
    });
}

function formatearFechaDash(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(texto) {
    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function obtenerSesionUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem("sesionUsuario") || "null");
    } catch {
        return null;
    }
}

function obtenerPermisosUsuario() {
    const sesion = obtenerSesionUsuario();
    return sesion?.permisos || [];
}

function tienePermiso(codigo) {
    const sesion = obtenerSesionUsuario();
    if (!sesion) return false;

    const rol = String(sesion.rol || "").toUpperCase();

	if (rol === "MASTER_ADMIN" || rol === "ADMINISTRADOR") {
	    return true;
	}

    return (sesion.permisos || []).includes(codigo);
}




function aplicarPermisosEnTopbar() {
    document.querySelectorAll(".topbar-nav-link[data-permiso]").forEach(link => {
        const permiso = link.dataset.permiso;
        link.style.display = tienePermiso(permiso) ? "" : "none";
    });

    const menu = document.getElementById("topbarMenu");
    if (menu) menu.style.visibility = "visible";
}


function aplicarPermisosEnVista() {
    document.querySelectorAll("[data-permiso]").forEach(el => {
        const permiso = el.dataset.permiso;
        el.style.display = tienePermiso(permiso) ? "" : "none";
    });
}

function obtenerSesionUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem("sesionUsuario") || "null");
    } catch {
        return null;
    }
}

function obtenerNombreMostrableUsuario() {
    const sesion = obtenerSesionUsuario();
    if (!sesion) return "Usuario";

    const nombre = String(sesion.nombre || "").trim();
    const apellido = String(sesion.apellido || "").trim();

    const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ");
    return nombreCompleto || sesion.username || "Usuario";
}

function obtenerInicialesUsuario() {
    const sesion = obtenerSesionUsuario();
    if (!sesion) return "U";

    const nombre = String(sesion.nombre || "").trim();
    const apellido = String(sesion.apellido || "").trim();

    const iniciales = [nombre, apellido]
        .filter(Boolean)
        .map(x => x.charAt(0).toUpperCase())
        .join("");

    if (iniciales) return iniciales.slice(0, 2);

    return String(sesion.username || "U").charAt(0).toUpperCase();
}

function aplicarDatosUsuarioEnUI() {
    const nombreUsuario = obtenerNombreMostrableUsuario();
    const iniciales = obtenerInicialesUsuario();

    const bienvenida = document.getElementById("dashboardNombreUsuario");
    if (bienvenida) {
        bienvenida.textContent = nombreUsuario;
    }

    const avatar = document.getElementById("topbarUserInitials");
    if (avatar) {
        avatar.textContent = iniciales;
    }
}

async function cargarNotificacionesPanel() {
    try {
        const response = await fetch('/api/stock/stock-bajo');
        if (!response.ok) throw new Error('Error');

        const stocks = await response.json();
        const panel = document.getElementById("panelNotificaciones");

        if (!stocks || stocks.length === 0) {
            panel.innerHTML = `
                <div style="text-align:center; padding: 12px; color:#6b7280;">
                    Sin notificaciones
                </div>
            `;
            return;
        }

        let html = "";

        stocks.forEach(stock => {
            const producto = stock.producto || {};
            const almacen = stock.almacenes || {};
            const cantidad = stock.cantidad || 0;
            const min = producto.stockMinimo || 0;
            const id = producto.id || '';

            html += `
                <div class="notif-item"
                     data-id="${id}"
                     style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;"
                     onmouseover="this.style.background='#f3f4f6'"
                     onmouseout="this.style.background='white'"
                >
                    <div style="font-weight:600; font-size:13px;">
                        ${escapeHtml(producto.nombre)}
                    </div>
                    <div style="font-size:11px; color:#6b7280;">
                        ${escapeHtml(almacen.nombre)}
                    </div>
                    <div style="font-size:12px; color:#dc2626;">
                        Stock: ${cantidad} / Min: ${min}
                    </div>
                </div>
            `;
        });

        panel.innerHTML = html;

        document.querySelectorAll(".notif-item").forEach(item => {
            item.addEventListener("click", () => {
                const id = item.getAttribute("data-id");

                sessionStorage.setItem("productoParaIngreso", id);
                document.getElementById("panelNotificaciones").style.display = "none";

                cargar({ preventDefault() {} }, "/ordenes");
            });
        });

    } catch (error) {
        console.error(error);
    }
}

function toggleNotificaciones() {
    const panel = document.getElementById("panelNotificaciones");

    if (panel.style.display === "none" || panel.style.display === "") {
        cargarNotificacionesPanel(); 
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}