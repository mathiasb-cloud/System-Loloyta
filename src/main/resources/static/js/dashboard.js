let dashboardCharts = {};

async function initDashboard() {
    try {
        const [
            productosRes,
            almacenesRes,
            stockRes,
            movimientosRes,
            mermasRes,
            motivosMermaRes
        ] = await Promise.all([
            fetch('/api/productos'),
            fetch('/api/almacenes'),
            fetch('/api/stock'),
            fetch('/api/movimientos/resumen'),
            fetch('/api/mermas'),
            fetch('/api/motivos-merma').catch(() => null)
        ]);

        const productosJson = productosRes.ok ? await productosRes.json() : [];
        const almacenes = almacenesRes.ok ? await almacenesRes.json() : [];
        const stock = stockRes.ok ? await stockRes.json() : [];
        const movimientos = movimientosRes.ok ? await movimientosRes.json() : [];
        const mermas = mermasRes.ok ? await mermasRes.json() : [];
        const motivosMerma = motivosMermaRes && motivosMermaRes.ok ? await motivosMermaRes.json() : [];

        const productos = productosJson.content || productosJson || [];

        renderKPIs({ productos, almacenes, stock, movimientos, mermas });
        renderAlertas({ stock, productos, movimientos });
        renderActividadReciente(movimientos);
        renderCharts({ stock, movimientos, mermas, motivosMerma });
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        renderDashboardError();
    }
}

function renderKPIs({ productos, almacenes, stock, movimientos, mermas }) {
    const productosActivos = productos.filter(p => p.activo !== false).length;
    const almacenesActivos = almacenes.filter(a => a.activo !== false).length;

    let criticos = 0;
    let costoMerma = 0;

    stock.forEach(s => {
        const cantidad = Number(s.cantidad || 0);
        const minimo = Number(s.producto?.stockMinimo || 0);
        const precio = Number(s.producto?.precioActual || 0);

        if (cantidad < minimo) {
            criticos++;
            costoMerma += (minimo - cantidad) * precio;
        }
    });

    const totalMermasConfirmadas = mermas.filter(m => m.estado === 'CONFIRMADA').length;

    setText('kpiProductos', formatearNumeroDashboard(productosActivos));
    setText('kpiAlmacenes', formatearNumeroDashboard(almacenesActivos));
    setText('kpiStockCritico', formatearNumeroDashboard(criticos));
    setText('kpiCostoMerma', formatearMonedaDashboard(costoMerma));

    setText('heroPerdidaMerma', formatearMonedaDashboard(costoMerma));
    setText(
        'heroPerdidaMermaMeta',
        `${totalMermasConfirmadas} mermas confirmadas · ${movimientos.length} movimientos consolidados`
    );
}

function renderAlertas({ stock, productos, movimientos }) {
    const contenedor = document.getElementById('alertasDashboard');
    if (!contenedor) return;

    const alertas = [];

    const criticos = stock
        .filter(s => Number(s.cantidad || 0) < Number(s.producto?.stockMinimo || 0))
        .sort((a, b) => {
            const aDiff = Number(a.producto?.stockMinimo || 0) - Number(a.cantidad || 0);
            const bDiff = Number(b.producto?.stockMinimo || 0) - Number(b.cantidad || 0);
            return bDiff - aDiff;
        })
        .slice(0, 4);

    criticos.forEach(item => {
        alertas.push({
            tipo: 'danger',
            titulo: `${item.producto?.nombre || 'Producto'} en nivel crítico`,
            texto: `Disponible: ${item.cantidad ?? 0} ${item.producto?.unidadMedida || ''} · mínimo: ${item.producto?.stockMinimo ?? 0}`
        });
    });

    const productosSinPrecio = productos
        .filter(p => Number(p.precioActual || 0) <= 0)
        .slice(0, 2);

    productosSinPrecio.forEach(item => {
        alertas.push({
            tipo: 'warning',
            titulo: `${item.nombre} sin precio operativo`,
            texto: 'Conviene actualizar el precio actual para mejorar los cálculos de salida y merma.'
        });
    });

    if (alertas.length === 0) {
        contenedor.innerHTML = `
            <div class="alert-item">
                <div class="alert-icon alert-icon--warning">
                    <i class="bi bi-check2-circle"></i>
                </div>
                <div>
                    <div class="alert-title">Sin alertas críticas</div>
                    <div class="alert-text">El panel no detectó incidencias urgentes en este momento.</div>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = alertas.map(a => `
        <div class="alert-item">
            <div class="alert-icon ${a.tipo === 'danger' ? 'alert-icon--danger' : 'alert-icon--warning'}">
                <i class="bi ${a.tipo === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle'}"></i>
            </div>
            <div>
                <div class="alert-title">${escapeHtmlDashboard(a.titulo)}</div>
                <div class="alert-text">${escapeHtmlDashboard(a.texto)}</div>
            </div>
        </div>
    `).join('');
}

function renderActividadReciente(movimientos) {
    const contenedor = document.getElementById('actividadRecienteDashboard');
    if (!contenedor) return;

    const recientes = [...movimientos]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 6);

    if (recientes.length === 0) {
        contenedor.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-left">
                    <div class="timeline-dot timeline-dot--ingreso"></div>
                    <div>
                        <div class="timeline-title">Sin actividad reciente</div>
                        <div class="timeline-meta">Aún no hay movimientos para mostrar.</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = recientes.map(m => `
        <div class="timeline-item">
            <div class="timeline-left">
                <div class="timeline-dot ${obtenerClaseTimeline(m.tipo)}"></div>
                <div>
                    <div class="timeline-title">${escapeHtmlDashboard(m.referencia || m.tipo || 'Movimiento')}</div>
                    <div class="timeline-meta">${escapeHtmlDashboard(m.tipo || 'Sin tipo')} · ${m.totalItems || 0} item(s)</div>
                </div>
            </div>
            <div class="timeline-date">${formatearFechaDashboard(m.fecha)}</div>
        </div>
    `).join('');
}

function renderCharts({ stock, movimientos, mermas }) {
    destruirChartsDashboard();

    renderChartMovimientosTipo(movimientos);
    renderChartEstadoStock(stock);
    renderChartTopCriticos(stock);
    renderChartMermasMotivo(mermas);
}

function renderChartMovimientosTipo(movimientos) {
    const ctx = document.getElementById('chartMovimientosTipo');
    if (!ctx) return;

    const conteo = {
        INGRESO: 0,
        SALIDA: 0,
        MERMA: 0
    };

    movimientos.forEach(m => {
        const tipo = (m.tipo || '').toUpperCase();
        if (conteo[tipo] !== undefined) conteo[tipo]++;
    });

    dashboardCharts.movimientosTipo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Salidas', 'Mermas'],
            datasets: [{
                data: [conteo.INGRESO, conteo.SALIDA, conteo.MERMA],
                borderRadius: 10,
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
            }]
        },
        options: baseChartOptions({
            plugins: {
                legend: { display: false }
            }
        })
    });
}

function renderChartEstadoStock(stock) {
    const ctx = document.getElementById('chartEstadoStock');
    if (!ctx) return;

    let ok = 0;
    let minimo = 0;
    let critico = 0;

    stock.forEach(s => {
        const cantidad = Number(s.cantidad || 0);
        const minimoStock = Number(s.producto?.stockMinimo || 0);

        if (cantidad < minimoStock) critico++;
        else if (cantidad === minimoStock) minimo++;
        else ok++;
    });

    dashboardCharts.estadoStock = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Óptimo', 'En mínimo', 'Crítico'],
            datasets: [{
                data: [ok, minimo, critico],
                backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
                borderWidth: 0
            }]
        },
        options: baseChartOptions({
            cutout: '68%'
        })
    });
}

function renderChartTopCriticos(stock) {
    const ctx = document.getElementById('chartTopCriticos');
    if (!ctx) return;

    const top = stock
        .filter(s => Number(s.cantidad || 0) < Number(s.producto?.stockMinimo || 0))
        .map(s => ({
            nombre: s.producto?.nombre || 'Producto',
            deficit: Number(s.producto?.stockMinimo || 0) - Number(s.cantidad || 0)
        }))
        .sort((a, b) => b.deficit - a.deficit)
        .slice(0, 6);

    dashboardCharts.topCriticos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top.map(x => x.nombre),
            datasets: [{
                data: top.map(x => x.deficit),
                borderRadius: 10,
                backgroundColor: '#2563eb'
            }]
        },
        options: baseChartOptions({
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            }
        })
    });
}

function renderChartMermasMotivo(mermas) {
    const ctx = document.getElementById('chartMermasMotivo');
    if (!ctx) return;

    const mapa = {};

    mermas
        .filter(m => (m.estado || '').toUpperCase() === 'CONFIRMADA')
        .forEach(m => {
            const nombre = m.motivo?.nombre || 'Sin motivo';
            mapa[nombre] = (mapa[nombre] || 0) + 1;
        });

    const labels = Object.keys(mapa);
    const values = Object.values(mapa);

    dashboardCharts.mermasMotivo = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#0ea5e9', '#14b8a6'],
                borderWidth: 0
            }]
        },
        options: baseChartOptions({})
    });
}

function baseChartOptions(extra = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 850,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    color: '#475569'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,.95)',
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255,255,255,.08)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148,163,184,.18)'
                },
                ticks: {
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: 'rgba(148,163,184,.18)'
                },
                ticks: {
                    color: '#64748b'
                }
            }
        },
        ...extra
    };
}

function destruirChartsDashboard() {
    Object.values(dashboardCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    dashboardCharts = {};
}

function renderDashboardError() {
    const contenedor = document.getElementById('contenido');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="dashboard-panel p-4">
            <h3 class="panel-title mb-2">No se pudo cargar el dashboard</h3>
            <p class="panel-subtitle mb-3">Revisa la disponibilidad de las APIs o vuelve a intentarlo.</p>
            <button class="btn btn-primary" onclick="mostrarDashboard(event)">Reintentar</button>
        </div>
    `;
}

function mostrarDashboard(event = null) {
    if (event?.preventDefault) event.preventDefault();

    document.querySelectorAll(".nav-dashboard .nav-link").forEach(link => {
        link.classList.remove("active");
    });

    const contenido = document.getElementById('contenido');
    if (!contenido) return;

    contenido.className = 'dashboard-root fade-in-soft';
    contenido.innerHTML = `
        <section class="dashboard-hero">
            <div class="dashboard-hero__content">
                <div class="dashboard-chip">
                    <i class="bi bi-activity"></i>
                    <span>Centro de control operativo</span>
                </div>

                <h1 class="dashboard-title">Panel general del sistema</h1>
                <p class="dashboard-subtitle">
                    Supervisa inventario, pérdidas, movimientos y actividad reciente desde una sola vista.
                </p>

                <div class="dashboard-actions">
                    <button class="btn btn-primary btn-icon" onclick="cargar({preventDefault(){ }}, '/ordenes')">
                        <i class="bi bi-plus-circle me-2"></i>
                        <span>Nuevo ingreso</span>
                    </button>

                    <button class="btn btn-outline-light btn-icon dashboard-outline-btn" onclick="cargar({preventDefault(){ }}, '/salidas')">
                        <i class="bi bi-truck me-2"></i>
                        <span>Nueva salida</span>
                    </button>
                </div>
            </div>

            <div class="dashboard-hero__side">
                <div class="hero-metric-card">
                    <div class="hero-metric-label">Pérdida estimada en mermas</div>
                    <div id="heroPerdidaMerma" class="hero-metric-value">S/ 0.00</div>
                    <div id="heroPerdidaMermaMeta" class="hero-metric-meta">Cargando información...</div>
                </div>
            </div>
        </section>

        <section class="kpi-grid">
            <article class="kpi-card">
                <div class="kpi-card__icon kpi-icon-blue">
                    <i class="bi bi-box-seam"></i>
                </div>
                <div class="kpi-card__body">
                    <div class="kpi-card__label">Productos activos</div>
                    <div id="kpiProductos" class="kpi-card__value">0</div>
                    <div class="kpi-card__meta">Catálogo actual</div>
                </div>
            </article>

            <article class="kpi-card">
                <div class="kpi-card__icon kpi-icon-indigo">
                    <i class="bi bi-building"></i>
                </div>
                <div class="kpi-card__body">
                    <div class="kpi-card__label">Almacenes operativos</div>
                    <div id="kpiAlmacenes" class="kpi-card__value">0</div>
                    <div class="kpi-card__meta">Puntos de almacenamiento</div>
                </div>
            </article>

            <article class="kpi-card">
                <div class="kpi-card__icon kpi-icon-orange">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <div class="kpi-card__body">
                    <div class="kpi-card__label">Ítems críticos</div>
                    <div id="kpiStockCritico" class="kpi-card__value">0</div>
                    <div class="kpi-card__meta">Stock por debajo del mínimo</div>
                </div>
            </article>

            <article class="kpi-card">
                <div class="kpi-card__icon kpi-icon-red">
                    <i class="bi bi-cash-stack"></i>
                </div>
                <div class="kpi-card__body">
                    <div class="kpi-card__label">Costo estimado de merma</div>
                    <div id="kpiCostoMerma" class="kpi-card__value">S/ 0.00</div>
                    <div class="kpi-card__meta">Impacto económico</div>
                </div>
            </article>
        </section>

        <section class="dashboard-main-grid">
            <div class="dashboard-panel panel-large">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Flujo de movimientos</h3>
                        <p class="panel-subtitle">Distribución de ingresos, salidas y mermas</p>
                    </div>
                </div>
                <div class="chart-wrap chart-wrap--medium">
                    <canvas id="chartMovimientosTipo"></canvas>
                </div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Estado del inventario</h3>
                        <p class="panel-subtitle">Nivel de salud del stock actual</p>
                    </div>
                </div>
                <div class="chart-wrap chart-wrap--medium">
                    <canvas id="chartEstadoStock"></canvas>
                </div>
            </div>

            <div class="dashboard-panel panel-large">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Top productos con mayor stock crítico</h3>
                        <p class="panel-subtitle">Productos que requieren atención inmediata</p>
                    </div>
                </div>
                <div class="chart-wrap chart-wrap--medium">
                    <canvas id="chartTopCriticos"></canvas>
                </div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Mermas por motivo</h3>
                        <p class="panel-subtitle">Concentración de pérdidas registradas</p>
                    </div>
                </div>
                <div class="chart-wrap chart-wrap--medium">
                    <canvas id="chartMermasMotivo"></canvas>
                </div>
            </div>
        </section>

        <section class="dashboard-bottom-grid">
            <div class="dashboard-panel">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Alertas operativas</h3>
                        <p class="panel-subtitle">Situaciones que deben revisarse</p>
                    </div>
                </div>
                <div id="alertasDashboard" class="alert-list"></div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-head">
                    <div>
                        <h3 class="panel-title">Actividad reciente</h3>
                        <p class="panel-subtitle">Últimos movimientos registrados</p>
                    </div>
                </div>
                <div id="actividadRecienteDashboard" class="timeline-list"></div>
            </div>
        </section>
    `;

    initDashboard();
}

function formatearMonedaDashboard(valor) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(Number(valor || 0));
}

function formatearNumeroDashboard(valor) {
    return new Intl.NumberFormat('es-PE').format(Number(valor || 0));
}

function formatearFechaDashboard(valor) {
    if (!valor) return '-';
    return new Date(valor).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerClaseTimeline(tipo) {
    if (tipo === 'INGRESO') return 'timeline-dot--ingreso';
    if (tipo === 'SALIDA') return 'timeline-dot--salida';
    if (tipo === 'MERMA') return 'timeline-dot--merma';
    return 'timeline-dot--ingreso';
}

function setText(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

function escapeHtmlDashboard(texto) {
    return String(texto || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}