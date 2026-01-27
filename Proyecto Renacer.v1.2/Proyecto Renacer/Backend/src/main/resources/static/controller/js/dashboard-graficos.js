/**
 * ============================================
 * GRAFICOS DEL DASHBOARD
 * Carga y muestra gráficos con datos reales del backend
 * ============================================
 */

let pieChart = null;
let lineChart = null;

/**
 * Inicializar gráficos del dashboard
 */
async function inicializarGraficos() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado');
        return;
    }

    if (typeof window.API === 'undefined') {
        console.error('API no está cargada');
        return;
    }

    try {
        // Cargar datos - ahora usamos ingresos (compras) en lugar de egresos
        const [ingresosResponse, materialesResponse] = await Promise.all([
            window.API.Ingreso.getAll().catch(() => []),
            window.API.Material.getAll().catch(() => [])
        ]);
        
        // Procesar respuestas del API
        const ingresos = Array.isArray(ingresosResponse) ? ingresosResponse : (ingresosResponse?.success ? ingresosResponse.data : (ingresosResponse?.data || []));
        const materiales = Array.isArray(materialesResponse) ? materialesResponse : (materialesResponse?.success ? materialesResponse.data : (materialesResponse?.data || []));
        
        console.log('📊 Datos cargados para gráficos:', { ingresos: ingresos.length, materiales: materiales.length });

        // Inicializar gráfico de pie (Materiales comprados hoy)
        inicializarPieChart(ingresos);

        // Inicializar gráfico de barras (Materiales más comprados)
        inicializarLineChart(ingresos, materiales);

        console.log('✅ Gráficos inicializados correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar gráficos:', error);
    }
}

/**
 * Inicializar gráfico de pie (Materiales comprados hoy)
 */
function inicializarPieChart(ingresos) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) {
        console.warn('Canvas pieChart no encontrado');
        return;
    }

    // Obtener fecha de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Calcular compras por material solo del día de hoy
    const comprasPorMaterial = {};
    let totalComprado = 0;

    // Filtrar ingresos del día de hoy
    ingresos.forEach(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        fechaIngreso.setHours(0, 0, 0, 0);

        // Solo procesar si es del día de hoy
        if (fechaIngreso.getTime() === hoy.getTime()) {
            if (ingreso.detalles && ingreso.detalles.length > 0) {
                ingreso.detalles.forEach(detalle => {
                    const materialNombre = detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || 'Sin nombre';
                    const cantidad = parseFloat(detalle.cantidad || 0);
                    
                    if (!comprasPorMaterial[materialNombre]) {
                        comprasPorMaterial[materialNombre] = 0;
                    }
                    comprasPorMaterial[materialNombre] += cantidad;
                    totalComprado += cantidad;
                });
            }
        }
    });

    // Si no hay datos del día de hoy, mostrar mensaje vacío
    if (totalComprado === 0) {
        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }
        actualizarLeyendaPieChart([], []);
        return;
    }

    // Preparar datos para el gráfico
    const labels = Object.keys(comprasPorMaterial);
    const data = Object.values(comprasPorMaterial);

    // Colores para los materiales
    const colores = [
        '#2d5a47', // Verde oscuro
        '#4a9b9b', // Verde azulado
        '#f59e0b', // Amarillo/naranja
        '#ef4444', // Rojo
        '#6366f1', // Indigo
        '#8b5cf6', // Púrpura
        '#ec4899', // Rosa
        '#14b8a6'  // Turquesa
    ];

    // Destruir gráfico anterior si existe
    if (pieChart) {
        pieChart.destroy();
    }

    // Crear nuevo gráfico
    pieChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colores.slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false // Ocultamos la leyenda porque está en el HTML
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const cantidad = context.parsed || 0;
                            const percentage = totalComprado > 0 ? ((cantidad / totalComprado) * 100).toFixed(1) : 0;
                            return `${label}: ${cantidad.toFixed(2)} Kg (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Actualizar leyenda con nombre del material y porcentaje
    actualizarLeyendaPieChart(labels, colores, comprasPorMaterial, totalComprado);
}

/**
 * Actualizar leyenda del gráfico de pie
 */
function actualizarLeyendaPieChart(labels, colores, comprasPorMaterial = {}, totalComprado = 0) {
    const legendContainer = document.querySelector('#pieChart')?.closest('.chart-container')?.querySelector('.chart-legend');
    if (!legendContainer) return;

    if (labels.length === 0) {
        legendContainer.innerHTML = '<div class="legend-item"><span>No hay compras registradas hoy</span></div>';
        return;
    }

    legendContainer.innerHTML = labels.map((label, index) => {
        const cantidad = comprasPorMaterial[label] || 0;
        const porcentaje = totalComprado > 0 ? ((cantidad / totalComprado) * 100).toFixed(1) : 0;
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colores[index] || '#999'}"></div>
                <span>${label} - ${cantidad.toFixed(2)} Kg (${porcentaje}%)</span>
            </div>
        `;
    }).join('');
}

/**
 * Inicializar gráfico de barras (Materiales más comprados)
 */
function inicializarLineChart(ingresos, materiales) {
    const canvas = document.getElementById('lineChart');
    if (!canvas) {
        console.warn('Canvas lineChart no encontrado');
        return;
    }

    // Calcular compras por material
    const comprasPorMaterial = {};
    
    ingresos.forEach(ingreso => {
        if (ingreso.detalles && ingreso.detalles.length > 0) {
            ingreso.detalles.forEach(detalle => {
                const materialNombre = detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || 'Desconocido';
                const cantidad = parseFloat(detalle.cantidad || 0);
                
                if (!comprasPorMaterial[materialNombre]) {
                    comprasPorMaterial[materialNombre] = 0;
                }
                comprasPorMaterial[materialNombre] += cantidad;
            });
        }
    });

    // Obtener los 5 materiales más comprados
    const materialesOrdenados = Object.entries(comprasPorMaterial)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = materialesOrdenados.map(([nombre]) => nombre);
    const data = materialesOrdenados.map(([, cantidad]) => cantidad);

    // Colores para las barras
    const colores = [
        '#2d5f5d', // Verde oscuro
        '#f59e0b', // Amarillo/naranja
        '#4a9b9b', // Verde azulado
        '#6366f1', // Indigo
        '#ec4899'  // Rosa
    ];

    // Destruir gráfico anterior si existe
    if (lineChart) {
        lineChart.destroy();
    }

    // Crear nuevo gráfico
    lineChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad comprada (Kg)',
                data: data,
                backgroundColor: colores.slice(0, labels.length).map(color => color + '80'), // 50% opacidad
                borderColor: colores.slice(0, labels.length),
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + ' Kg';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Cantidad: ${context.parsed.y.toFixed(2)} Kg`;
                        }
                    }
                }
            }
        }
    });

    // Actualizar leyenda en el HTML
    actualizarLeyendaLineChart(labels, colores);
}

/**
 * Actualizar leyenda del gráfico de barras
 */
function actualizarLeyendaLineChart(labels, colores) {
    const chartContainer = document.querySelector('#lineChart')?.closest('.chart-container');
    if (!chartContainer) return;

    const legendContainer = chartContainer.querySelector('.chart-legend');
    const chartTitle = chartContainer.querySelector('.chart-title');

    if (chartTitle) {
        chartTitle.textContent = 'Materiales más comprados';
    }

    if (legendContainer) {
        if (labels.length === 0) {
            legendContainer.innerHTML = '<div class="legend-item"><span>No hay compras registradas</span></div>';
            return;
        }
        legendContainer.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colores[index] || '#999'}"></div>
                <span>${label}</span>
            </div>
        `).join('');
    }
}

function renacerScheduleGraficos() {
    // Esperar a que el DOM y librerías estén disponibles
    setTimeout(() => {
        try { inicializarGraficos(); } catch (e) { console.error(e); }
    }, 800);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerScheduleGraficos);
} else {
    renacerScheduleGraficos();
}

// SPA: al volver a Inicio, reconstruir gráficos
window.addEventListener('renacer:pageLoaded', (e) => {
    const file = (e && e.detail && e.detail.file) ? String(e.detail.file).toLowerCase() : '';
    if (file !== 'inicio.html') return;
    renacerScheduleGraficos();
});

// Función para actualizar gráficos (útil para refrescar después de nuevas operaciones)
window.actualizarGraficos = inicializarGraficos;

