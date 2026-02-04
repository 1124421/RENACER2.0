/**
 * ==========================================
 * ARCHIVO: controller/js/dashboard-operaciones.js
 * Gestión de operaciones de compra y venta con conexión al backend
 * ==========================================
 */

let operacionesTemporales = [];
let dashboardInicializado = false;
let asociadosList = [];
let materialesList = [];
let barriosList = [];
let bodegasList = [];

// Verificar que la API esté cargada
if (typeof window.API === 'undefined') {
    console.error('❌ API module no está cargado. Asegúrate de incluir api.js antes de este script.');
}

/**
 * Cargar datos iniciales del backend
 */
async function cargarDatosIniciales() {
    try {
        console.log('🔄 Cargando datos del backend...');
        
        // Cargar asociados, materiales, barrios y bodegas en paralelo
        [asociadosList, materialesList, barriosList, bodegasList] = await Promise.all([
            window.API.Asociado.getAll().catch(() => []),
            window.API.Material.getAll().catch(() => []),
            window.API.Barrio.getAll().catch(() => []),
            window.API.Bodega.getAll().catch(() => [])
        ]);

        console.log('✅ Datos cargados:', {
            asociados: asociadosList.length,
            materiales: materialesList.length,
            barrios: barriosList.length,
            bodegas: bodegasList.length
        });

        // Cargar operaciones guardadas
        await cargarOperacionesGuardadas();
        
        // Actualizar dropdowns y búsquedas
        actualizarBuscadores();
    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
        showError('Error al cargar datos del servidor');
    }
}

/**
 * Cargar operaciones guardadas del backend
 */
async function cargarOperacionesGuardadas() {
    try {
        const [ingresos, egresos] = await Promise.all([
            window.API.Ingreso.getAll().catch(() => []),
            window.API.Egreso.getAll().catch(() => [])
        ]);

        // Convertir ingresos a formato de operación
        ingresos.forEach(ingreso => {
            if (ingreso.detalles && ingreso.detalles.length > 0) {
                ingreso.detalles.forEach(detalle => {
                    operacionesTemporales.push({
                        id: ingreso.idIngreso,
                        tipo: 'compra',
                        fecha: new Date(ingreso.fecha).toLocaleString('es-CO'),
                        asociado: ingreso.asociado ? `${ingreso.asociado.nombre} ${ingreso.asociado.apellido}` : '-',
                        documento: ingreso.asociado?.documento || '-',
                        carreta: ingreso.asociado?.carreta || '-',
                        ruta: ingreso.barrio?.nombre || '-',
                        material: detalle.material?.nombre || '-',
                        peso: parseFloat(detalle.cantidad),
                        precioTotal: parseFloat(detalle.precioPorKg) * parseFloat(detalle.cantidad),
                        rechazado: 0,
                        tipoAsociado: ingreso.asociado?.tipo || '-',
                        saved: true // Marca que ya está guardado
                    });
                });
            }
        });

        // Convertir egresos a formato de operación
        egresos.forEach(egreso => {
            if (egreso.detalles && egreso.detalles.length > 0) {
                egreso.detalles.forEach(detalle => {
                    operacionesTemporales.push({
                        id: egreso.idEgreso,
                        tipo: 'venta',
                        fecha: new Date(egreso.fecha).toLocaleString('es-CO'),
                        asociado: egreso.cliente?.nombreEmpresa || '-',
                        documento: egreso.cliente?.documento || '-',
                        carreta: '-',
                        ruta: '-',
                        material: detalle.material?.nombre || '-',
                        peso: parseFloat(detalle.cantidad),
                        precioTotal: parseFloat(detalle.precioKgVenta) * parseFloat(detalle.cantidad),
                        rechazado: 0,
                        tipoAsociado: '-',
                        saved: true
                    });
                });
            }
        });

        renderizarTabla();
        calcularSubtotal();
    } catch (error) {
        console.error('❌ Error al cargar operaciones:', error);
    }
}

/**
 * Actualizar los buscadores de asociados y materiales
 */
function actualizarBuscadores() {
    // Configurar búsqueda de asociados en modal de compra
    const searchAsociadoCompra = document.getElementById('searchAsociadoCompra');
    if (searchAsociadoCompra) {
        // Esto se manejará con un componente de búsqueda/select
        console.log('Buscador de asociados configurado');
    }

    // Configurar búsqueda de materiales
    const searchMaterialCompra = document.getElementById('searchMaterialCompra');
    if (searchMaterialCompra) {
        console.log('Buscador de materiales configurado');
    }
}

function inicializarDashboardOperaciones() {
    if (dashboardInicializado) return;
    dashboardInicializado = true;

    const tbody = document.querySelector('.operations-table tbody');
    const subtotalEl = document.querySelector('.subtotal');
    const btnRegistrar = document.querySelector('.btn-register');

    if (!tbody || !subtotalEl) {
        console.warn('Elementos del dashboard no encontrados');
        return;
    }

    // Renderizar tabla
    function renderizarTabla() {
        if (operacionesTemporales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="empty-state">
                        <div class="empty-content">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            <p class="empty-title">No hay operaciones en curso</p>
                            <p class="empty-subtitle">Selecciona "Registro de Compras" o "Registro de Ventas" para comenzar</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = operacionesTemporales.map((op, index) => `
            <tr>
                <td>${op.id || index + 1}</td>
                <td>${op.fecha}</td>
                <td>${op.asociado}</td>
                <td>${op.documento}</td>
                <td>${op.carreta || '-'}</td>
                <td>${op.ruta || '-'}</td>
                <td>${op.material}</td>
                <td>${op.peso} Kg</td>
                <td>$${op.precioTotal.toLocaleString()}</td>
                <td>${op.rechazado || '0'} Kg</td>
                <td>${op.tipoAsociado || '-'}</td>
                <td>
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${op.tipo === 'compra' ? '#e3f2fd' : '#e8f5e9'}; color: ${op.tipo === 'compra' ? '#1976d2' : '#388e3c'};">
                        ${op.tipo === 'compra' ? 'Compra' : 'Venta'}
                    </span>
                    ${op.saved ? '<span style="margin-left: 8px; color: #666; font-size: 10px;">✓ Guardado</span>' : ''}
                </td>
            </tr>
        `).join('');
    }

    // Calcular subtotal
    function calcularSubtotal() {
        const total = operacionesTemporales
            .filter(op => !op.saved) // Solo operaciones no guardadas
            .reduce((sum, op) => sum + op.precioTotal, 0);
        subtotalEl.textContent = `Subtotal: $${total.toLocaleString()}`;
    }

    // Agregar listeners a los botones de los modales
    function agregarListeners() {
        if (window.dashboardClickHandler) {
            document.removeEventListener('click', window.dashboardClickHandler);
        }

        window.dashboardClickHandler = async (e) => {
            if (e.target.dataset.procesado) return;

            // Botón Agregar en modal de Compra
            if (e.target.closest('#compraModal .btn-primary')) {
                e.preventDefault();
                e.target.dataset.procesado = 'true';
                setTimeout(() => delete e.target.dataset.procesado, 500);

                try {
                    // Obtener items desde modales-compra-venta.js
                    const itemsCompraFunc = window.getItemsCompra || (() => []);
                    const asociadoSeleccionadoFunc = window.getAsociadoSeleccionadoCompra || (() => null);
                    const items = itemsCompraFunc();
                    const asociadoSel = asociadoSeleccionadoFunc();

                    if (!items || items.length === 0) {
                        showWarning('Por favor agregue al menos un material');
                        delete e.target.dataset.procesado;
                        return;
                    }

                    if (!asociadoSel) {
                        showWarning('Por favor seleccione un asociado');
                        delete e.target.dataset.procesado;
                        return;
                    }

                    // Obtener datos del modal
                    const carreta = document.querySelector('#compraModal input[placeholder*="Carreta"], #compraModal input[placeholder*="carreta"]')?.value?.trim() || '';
                    const rutaInput = document.querySelector('#compraModal input[placeholder*="Ruta"], #compraModal input[placeholder*="ruta"]')?.value?.trim() || '';
                    
                    // Buscar barrio (ruta)
                    const barrio = barriosList.find(b => 
                        b.nombre.toLowerCase() === rutaInput.toLowerCase()
                    ) || (barriosList.length > 0 ? barriosList[0] : null);

                    if (!barrio) {
                        showWarning('Por favor seleccione una ruta válida');
                        delete e.target.dataset.procesado;
                        return;
                    }

                    // Procesar cada item agregado
                    items.forEach(item => {
                        if (!item.material || item.cantidad <= 0) return;

                        // Crear operación temporal
                        const operacion = {
                            tipo: 'compra',
                            fecha: new Date().toLocaleString('es-CO'),
                            asociado: `${asociadoSel.nombre} ${asociadoSel.apellido}`.trim(),
                            documento: asociadoSel.documento,
                            carreta: carreta,
                            ruta: barrio.nombre,
                            material: item.material.nombre,
                            peso: item.cantidad,
                            precioTotal: item.precioTotal,
                            rechazado: 0,
                            tipoAsociado: asociadoSel.tipo || '-',
                            saved: false,
                            // Datos para guardar en backend
                            asociadoId: asociadoSel.idAsociado,
                            materialId: item.material.idMaterial,
                            barrioId: barrio.idBarrio,
                            cantidad: item.cantidad,
                            precioPorKg: item.precioPorKg,
                            bodegaId: bodegasList.length > 0 ? bodegasList[0].idBodega : null
                        };

                        operacionesTemporales.push(operacion);
                    });

                    renderizarTabla();
                    calcularSubtotal();
                    window.closeModal('compraModal');
                    showSuccess('Compra agregada a operaciones');
                } catch (error) {
                    console.error('Error al agregar compra:', error);
                    showError('Error al agregar la compra');
                    delete e.target.dataset.procesado;
                }
            }

            // Botón Agregar en modal de Venta
            if (e.target.closest('#ventaModal .btn-primary')) {
                e.preventDefault();
                e.target.dataset.procesado = 'true';
                setTimeout(() => delete e.target.dataset.procesado, 500);

                try {
                    // Obtener items desde modales-compra-venta.js
                    const itemsVentaFunc = window.getItemsVenta || (() => []);
                    const clienteSeleccionadoFunc = window.getClienteSeleccionadoVenta || (() => null);
                    const items = itemsVentaFunc();
                    const clienteSel = clienteSeleccionadoFunc();

                    if (!items || items.length === 0) {
                        showWarning('Por favor agregue al menos un material');
                        delete e.target.dataset.procesado;
                        return;
                    }

                    if (!clienteSel) {
                        showWarning('Por favor seleccione un cliente');
                        delete e.target.dataset.procesado;
                        return;
                    }

                    // Procesar cada item agregado
                    items.forEach(item => {
                        if (!item.material || item.cantidad <= 0) return;

                        // Crear operación temporal
                        const operacion = {
                            tipo: 'venta',
                            fecha: new Date().toLocaleString('es-CO'),
                            asociado: clienteSel.nombreEmpresa || '-',
                            documento: clienteSel.documento || '-',
                            carreta: '-',
                            ruta: '-',
                            material: item.material.nombre,
                            peso: item.cantidad,
                            precioTotal: item.precioTotal,
                            rechazado: 0,
                            tipoAsociado: '-',
                            saved: false,
                            // Datos para guardar en backend
                            clienteId: clienteSel.idCliente,
                            materialId: item.material.idMaterial,
                            cantidad: item.cantidad,
                            precioKgVenta: item.precioPorKg,
                            bodegaOrigenId: bodegasList.length > 0 ? bodegasList[0].idBodega : null
                        };

                        operacionesTemporales.push(operacion);
                    });

                    renderizarTabla();
                    calcularSubtotal();
                    window.closeModal('ventaModal');
                    showSuccess('Venta agregada a operaciones');
                } catch (error) {
                    console.error('Error al agregar venta:', error);
                    showError('Error al agregar la venta');
                    delete e.target.dataset.procesado;
                }
            }

            // Botón Guardar en modal de Asociado
            if (e.target.closest('#asociadoModal .btn-primary')) {
                e.preventDefault();
                e.target.dataset.procesado = 'true';
                setTimeout(() => delete e.target.dataset.procesado, 500);

                try {
                    const nombreCompleto = document.getElementById('nombreModalInicio')?.value?.trim();
                    const documento = document.getElementById('documentoModalInicio')?.value?.trim();
                    const telefono = document.getElementById('contactoModalInicio')?.value?.trim();
                    const correo = document.getElementById('correoModalInicio')?.value?.trim();
                    const tipoAsociado = document.getElementById('tipoAsociadoModalInicio')?.value?.trim();

                    if (!nombreCompleto || !documento) {
                        showWarning('Por favor complete nombre y documento');
                        return;
                    }

                    // Separar nombre y apellido
                    const partes = nombreCompleto.split(' ');
                    const nombre = partes[0] || '';
                    const apellido = partes.slice(1).join(' ') || '';

                    // Crear asociado en el backend
                    const nuevoAsociado = {
                        nombre: nombre,
                        apellido: apellido,
                        documento: documento,
                        telefono: telefono || null,
                        correo: correo || null,
                        tipo: tipoAsociado === 'Aforado' ? 'Aforado' : 'No_aforado',
                        carreta: null,
                        barrio: barriosList.length > 0 ? { idBarrio: barriosList[0].idBarrio } : null
                    };

                    await window.API.Asociado.create(nuevoAsociado);

                    // Limpiar formulario
                    ['nombreModalInicio', 'documentoModalInicio', 'contactoModalInicio', 
                     'correoModalInicio', 'fechaInicioModalInicio', 'contratoModalInicio', 
                     'cargoModalInicio', 'idUnicoModalInicio', 'tipoAsociadoModalInicio'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });

                    // Recargar lista de asociados
                    asociadosList = await window.API.Asociado.getAll();

                    window.closeModal('asociadoModal');
                    showSuccess('Asociado guardado exitosamente');
                } catch (error) {
                    console.error('Error al guardar asociado:', error);
                    showError(error.message || 'Error al guardar el asociado');
                }
            }
        };

        document.addEventListener('click', window.dashboardClickHandler);
    }

    // Botón Registrar operación
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', async () => {
            const operacionesPendientes = operacionesTemporales.filter(op => !op.saved);
            
            if (operacionesPendientes.length === 0) {
                showWarning('No hay operaciones nuevas para registrar');
                return;
            }

            try {
                const confirmar = await confirm('¿Desea registrar todas las operaciones?', {
                    title: 'Confirmar registro',
                    confirmText: 'Sí, registrar',
                    cancelText: 'Cancelar',
                    type: 'info'
                });

                if (!confirmar) return;

                // Agrupar operaciones por tipo y asociado/cliente
                const comprasPorAsociado = {};
                const ventasPorCliente = {};

                operacionesPendientes.forEach(op => {
                    if (op.tipo === 'compra') {
                        const key = `${op.asociadoId}_${op.barrioId}`;
                        if (!comprasPorAsociado[key]) {
                            comprasPorAsociado[key] = {
                                asociadoId: op.asociadoId,
                                barrioId: op.barrioId,
                                fecha: new Date().toISOString(),
                                detalles: [],
                                totalPagado: 0
                            };
                        }
                        comprasPorAsociado[key].detalles.push({
                            material: { idMaterial: op.materialId },
                            bodegaDestino: { idBodega: op.bodegaId },
                            cantidad: op.cantidad,
                            precioPorKg: op.precioPorKg
                        });
                        comprasPorAsociado[key].totalPagado += op.precioTotal;
                    } else if (op.tipo === 'venta') {
                        const key = `${op.clienteId}`;
                        if (!ventasPorCliente[key]) {
                            ventasPorCliente[key] = {
                                clienteId: op.clienteId,
                                fecha: new Date().toISOString(),
                                detalles: [],
                                totalVenta: 0
                            };
                        }
                        ventasPorCliente[key].detalles.push({
                            material: { idMaterial: op.materialId },
                            bodegaOrigen: { idBodega: op.bodegaOrigenId },
                            cantidad: op.cantidad,
                            precioKgVenta: op.precioKgVenta
                        });
                        ventasPorCliente[key].totalVenta += op.precioTotal;
                    }
                });

                // Registrar compras en el backend
                for (const key in comprasPorAsociado) {
                    const compra = comprasPorAsociado[key];
                    try {
                        await window.API.Ingreso.create({
                            asociado: { idAsociado: compra.asociadoId },
                            barrio: { idBarrio: compra.barrioId },
                            fecha: compra.fecha,
                            totalPagado: compra.totalPagado,
                            detalles: compra.detalles
                        });
                        console.log('✅ Compra registrada:', compra);
                    } catch (error) {
                        console.error('❌ Error al registrar compra:', error);
                        throw error;
                    }
                }

                // Registrar ventas en el backend
                for (const key in ventasPorCliente) {
                    const venta = ventasPorCliente[key];
                    try {
                        await window.API.Egreso.create({
                            cliente: { idCliente: venta.clienteId },
                            fecha: venta.fecha,
                            totalVenta: venta.totalVenta,
                            detalles: venta.detalles
                        });
                        console.log('✅ Venta registrada:', venta);
                    } catch (error) {
                        console.error('❌ Error al registrar venta:', error);
                        throw error;
                    }
                }

                // Limpiar operaciones temporales no guardadas
                operacionesTemporales = operacionesTemporales.filter(op => op.saved);

                renderizarTabla();
                calcularSubtotal();
                
                // Recargar operaciones guardadas y actualizar gráficos
                await cargarOperacionesGuardadas();
                if (window.actualizarGraficos) {
                    window.actualizarGraficos();
                }
                
                showSuccess('Operaciones registradas exitosamente');
            } catch (error) {
                console.error('Error al registrar operaciones:', error);
                showError('Error al registrar las operaciones');
            }
        });
    }

    // Inicializar
    renderizarTabla();
    agregarListeners();
    
    // Cargar datos del backend
    cargarDatosIniciales();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDashboardOperaciones);
} else {
    inicializarDashboardOperaciones();
}
