/**
 * ============================================
 * DASHBOARD DE INICIO
 * Maneja nombre de usuario, fecha y tabla de actividad reciente
 * ============================================
 */

/**
 * Inicializar dashboard de inicio
 */
function inicializarDashboardInicio() {
    actualizarNombreUsuario();
    actualizarFechaActual();
    inicializarTablaActividadReciente();
}

/**
 * Actualizar nombre de usuario en el banner
 */
function actualizarNombreUsuario() {
    const welcomeTitle = document.getElementById('welcomeUserName');
    if (!welcomeTitle) return;

    // Obtener datos del perfil desde sessionStorage
    const datosGuardados = sessionStorage.getItem('perfilUsuario');
    let nombreCompleto = 'Usuario';

    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            nombreCompleto = `${datos.nombres || ''} ${datos.apellidos || ''}`.trim() || 'Usuario';
        } catch (error) {
            console.error('Error al parsear datos del usuario:', error);
        }
    }

    welcomeTitle.textContent = `Buen día, ${nombreCompleto}`;
}

/**
 * Actualizar fecha actual
 */
function actualizarFechaActual() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;

    const ahora = new Date();
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
    dateElement.textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

/**
 * Inicializar tabla de actividad reciente
 */
let intervaloActividad = null;
let actividadReciente = [];
let actividadListenerAdded = false;

async function inicializarTablaActividadReciente() {
    const tbody = document.getElementById('actividadRecienteTbody');
    if (!tbody) return;

    // Evitar múltiples intervalos en SPA (al navegar y volver)
    if (intervaloActividad) return;

    // Cargar actividad inicial
    await cargarActividadReciente();

    // Actualizar cada 5 segundos para tiempo real
    intervaloActividad = setInterval(async () => {
        await cargarActividadReciente();
    }, 5000);

    // Escuchar eventos de nuevas operaciones (solo una vez)
    if (!actividadListenerAdded) {
        actividadListenerAdded = true;
        window.addEventListener('operacionGuardada', async () => {
            await cargarActividadReciente();
            // Actualizar gráficos también
            if (window.actualizarGraficos) {
                window.actualizarGraficos();
            }
        });
    }
}

// SPA: pausar el loop cuando salimos de Inicio para no consumir recursos
window.addEventListener('renacer:pageWillUnload', (e) => {
    const file = e && e.detail ? e.detail.file : '';
    if ((file || '').toLowerCase() !== 'inicio.html') return;
    if (intervaloActividad) {
        clearInterval(intervaloActividad);
        intervaloActividad = null;
    }
});

/**
 * Cargar actividad reciente (últimas 10 operaciones)
 */
async function cargarActividadReciente() {
    if (typeof window.API === 'undefined') {
        console.warn('API no disponible');
        return;
    }

    try {
        const [ingresos, egresos] = await Promise.all([
            window.API.Ingreso.getAll().catch(() => []),
            window.API.Egreso.getAll().catch(() => [])
        ]);

        // Procesar ingresos (compras)
        const compras = [];
        if (Array.isArray(ingresos)) {
            ingresos.forEach(ingreso => {
                if (ingreso.detalles && ingreso.detalles.length > 0) {
                    ingreso.detalles.forEach(detalle => {
                        const nombreMaterial = detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || 'N/A';
                        compras.push({
                            fecha: new Date(ingreso.fecha),
                            tipo: 'Compra',
                            asociado: ingreso.asociado ? `${ingreso.asociado.nombre || ''} ${ingreso.asociado.apellido || ''}`.trim() : 'N/A',
                            material: nombreMaterial,
                            cantidad: parseFloat(detalle.cantidad || 0),
                            precioTotal: parseFloat(detalle.precioPorKg || 0) * parseFloat(detalle.cantidad || 0),
                            estado: 'Completado'
                        });
                    });
                }
            });
        }

        // Procesar egresos (ventas)
        const ventas = [];
        if (Array.isArray(egresos)) {
            egresos.forEach(egreso => {
                if (egreso.detalles && egreso.detalles.length > 0) {
                    egreso.detalles.forEach(detalle => {
                        ventas.push({
                            fecha: new Date(egreso.fecha),
                            tipo: 'Venta',
                            material: detalle.material?.nombre || 'N/A',
                            cantidad: parseFloat(detalle.cantidad || 0),
                            precioTotal: parseFloat(detalle.precioKgVenta || 0) * parseFloat(detalle.cantidad || 0),
                            estado: 'Completado'
                        });
                    });
                }
            });
        }

        // Combinar y ordenar por fecha (más reciente primero)
        actividadReciente = [...compras, ...ventas]
            .sort((a, b) => b.fecha - a.fecha)
            .slice(0, 10); // Solo las últimas 10

        renderizarTablaActividad();
    } catch (error) {
        console.error('Error al cargar actividad reciente:', error);
    }
}

/**
 * Renderizar tabla de actividad
 */
function renderizarTablaActividad() {
    const tbody = document.getElementById('actividadRecienteTbody');
    if (!tbody) return;

    if (actividadReciente.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <p class="empty-title">No hay actividad reciente</p>
                        <p class="empty-subtitle">Las compras y ventas se mostrarán aquí en tiempo real</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = actividadReciente.map(actividad => {
        const fechaFormateada = actividad.fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const tipoColor = actividad.tipo === 'Compra' ? '#1976d2' : '#388e3c';
        const tipoBg = actividad.tipo === 'Compra' ? '#e3f2fd' : '#e8f5e9';

        return `
            <tr>
                <td>${fechaFormateada}</td>
                <td>
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${tipoBg}; color: ${tipoColor};">
                        ${actividad.tipo}
                    </span>
                </td>
                <td>${actividad.material}</td>
                <td>${actividad.cantidad.toFixed(2)} Kg</td>
                <td>$${actividad.precioTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; background: #e8f5e9; color: #2e7d32;">
                        ${actividad.estado}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Inicializar cuando el DOM esté listo
function renacerScheduleDashboardInicio() {
    // pequeño delay para asegurar que el DOM ya fue swap/restaurado por el router SPA
    setTimeout(() => {
        try { inicializarDashboardInicio(); } catch (e) { console.error(e); }
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerScheduleDashboardInicio);
} else {
    renacerScheduleDashboardInicio();
}

// SPA: cuando volvemos a Inicio, re-inicializar (recarga datos y re-activa intervalos)
window.addEventListener('renacer:pageLoaded', (e) => {
    const file = (e && e.detail && e.detail.file) ? String(e.detail.file).toLowerCase() : '';
    if (file !== 'inicio.html') return;
    renacerScheduleDashboardInicio();
});

// Exportar función para actualizar gráficos cuando se guarde una operación
window.actualizarActividadReciente = cargarActividadReciente;

