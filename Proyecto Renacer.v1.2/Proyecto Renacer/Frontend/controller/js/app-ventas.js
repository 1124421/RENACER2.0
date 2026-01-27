// app-ventas.js
// Gestión completa de Ventas (EncabezadoEgreso)

if (typeof API === 'undefined') {
    console.error('❌ API module no está cargado. Asegúrate de incluir api.js antes de este script.');
}

let ventasInicializado = false;

async function inicializarVentas() {
    if (ventasInicializado) return;
    ventasInicializado = true;

    // ============================================
    // MÓDULO EN CONSTRUCCIÓN (placeholder)
    // ============================================
    const tbody = document.getElementById("ventasTbody");
    const renderProximamente = () => {
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 40px;">
                    <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
                        <div style="font-weight:700; font-size:16px; color:#111;">Próximamente funcionando</div>
                        <div style="color:#6b7280;">El módulo de Ventas está en desarrollo. Vuelve pronto.</div>
                    </div>
                </td>
            </tr>
        `;
    };

    const disable = (el) => {
        if (!el) return;
        el.setAttribute('disabled', 'disabled');
        el.classList.add('is-disabled');
    };

    // Deshabilitar UI para evitar acciones/errores
    disable(document.getElementById("btnNuevaVenta"));
    disable(document.getElementById("searchInput"));
    disable(document.getElementById("fechaDesdeVenta"));
    disable(document.getElementById("fechaHastaVenta"));
    disable(document.getElementById("filtroCliente"));
    document.querySelectorAll('.filter-actions .btn-clear, .filter-actions .btn-apply')
        .forEach(btn => disable(btn));

    // Exponer stub por compatibilidad (si algún script intenta recargar)
    window.cargarVentas = async () => renderProximamente();

    renderProximamente();
    return;

    /* IMPLEMENTACIÓN ORIGINAL (pendiente)
    let ventas = [];
    const tbody = document.getElementById("ventasTbody");

    // Referencias
    let btnNuevaVenta, searchInput, fechaDesdeInput, fechaHastaInput, filtroCliente;
    let editVentaId = null;

    function inicializarReferencias() {
        btnNuevaVenta = document.getElementById("btnNuevaVenta");
        console.log('🔍 Buscando btnNuevaVenta:', btnNuevaVenta);
        searchInput = document.getElementById("searchInput");
        fechaDesdeInput = document.getElementById("fechaDesdeVenta");
        fechaHastaInput = document.getElementById("fechaHastaVenta");
        filtroCliente = document.getElementById("filtroCliente");

        if (typeof flatpickr !== 'undefined') {
            flatpickr(fechaDesdeInput, { locale: 'es', dateFormat: 'd/m/Y' });
            flatpickr(fechaHastaInput, { locale: 'es', dateFormat: 'd/m/Y' });
        }
    }

    window.cargarVentas = async () => {
        try {
            // Verificar credenciales antes de intentar cargar
            const username = localStorage.getItem('username');
            const password = localStorage.getItem('password');
            
            if (!username || !password) {
                console.warn('⚠️ No hay credenciales. Las ventas se cargarán después del login.');
                ventas = [];
                applyCurrentFiltersAndRender();
                return;
            }
            
            const response = await API.Egreso.getAll();
            if (response.success) {
                ventas = response.data || [];
                applyCurrentFiltersAndRender();
            } else {
                // Si es error de credenciales, no mostrar error, solo usar lista vacía
                if (response.status === 401 || (response.message && response.message.includes('credenciales'))) {
                    console.warn('⚠️ No hay credenciales válidas. Las ventas se cargarán después del login.');
                    ventas = [];
                    applyCurrentFiltersAndRender();
                } else {
                    console.error('Error al cargar ventas:', response.message);
                    // (si se reactiva este módulo más adelante, aquí se podría notificar el error al usuario)
                }
            }
        } catch (error) {
            // Si es error de credenciales, no mostrar error
            if (error.message && error.message.includes('credenciales')) {
                console.warn('⚠️ No hay credenciales. Las ventas se cargarán después del login.');
                ventas = [];
                applyCurrentFiltersAndRender();
            } else {
                // Solo mostrar error si NO es por credenciales
                console.error('Error al cargar ventas:', error);
                // NO mostrar showError aquí - solo loguear
            }
        }
    };

    function renderTable(list = null) {
        const data = Array.isArray(list) ? list : ventas;
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No hay ventas registradas</td></tr>';
            return;
        }

        data.forEach((venta) => {
            const tr = document.createElement('tr');
            const fecha = venta.fecha ? new Date(venta.fecha).toLocaleString('es-CO') : 'N/A';
            const cliente = venta.cliente ? venta.cliente.nombreEmpresa : 'N/A';
            const documento = venta.cliente ? (venta.cliente.nit || 'N/A') : 'N/A';
            const materiales = venta.detalles ? venta.detalles.map(d => d.material?.nombre || 'N/A').join(', ') : 'N/A';
            const total = venta.totalVenta ? parseFloat(venta.totalVenta).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '$0';

            tr.innerHTML = `
                <td>${venta.idEgreso || ''}</td>
                <td>${fecha}</td>
                <td>${cliente}</td>
                <td>${documento}</td>
                <td>${materiales}</td>
                <td>${total}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" onclick="window.verVenta(${venta.idEgreso})" title="Ver">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="window.editarVenta(${venta.idEgreso})" title="Editar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="window.eliminarVenta(${venta.idEgreso})" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.verVenta = async (id) => {
        try {
            const response = await API.Egreso.getById(id);
            if (response.success) {
                const venta = response.data;
                document.getElementById('viewVentaId').textContent = venta.idEgreso || 'N/A';
                document.getElementById('viewVentaFecha').textContent = venta.fecha ? new Date(venta.fecha).toLocaleString('es-CO') : 'N/A';
                document.getElementById('viewVentaCliente').textContent = venta.cliente ? venta.cliente.nombreEmpresa : 'N/A';
                document.getElementById('viewVentaDocumento').textContent = venta.cliente ? (venta.cliente.nit || 'N/A') : 'N/A';
                document.getElementById('viewVentaTotal').textContent = venta.totalVenta ? parseFloat(venta.totalVenta).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '$0';
                
                const detallesTbody = document.getElementById('viewVentaDetalles');
                if (detallesTbody && venta.detalles) {
                    detallesTbody.innerHTML = venta.detalles.map(d => `
                        <tr>
                            <td>${d.material?.nombre || 'N/A'}</td>
                            <td>${d.cantidad} Kg</td>
                            <td>$${parseFloat(d.precioKgVenta).toLocaleString('es-CO')}</td>
                            <td>${d.bodegaOrigen?.nombre || 'N/A'}</td>
                            <td>$${parseFloat(d.cantidad * d.precioKgVenta).toLocaleString('es-CO')}</td>
                        </tr>
                    `).join('');
                }

                window.openModal('modalVerVenta');
            } else {
                showError('No se pudo cargar la venta.');
            }
        } catch (error) {
            console.error('Error al ver venta:', error);
            showError('Error al cargar la venta.');
        }
    };

    window.editarVenta = async (id) => {
        try {
            const response = await API.Egreso.getById(id);
            if (response.success) {
                const venta = response.data;
                editVentaId = id;
                // Similar a editarCompra pero para ventas
                window.openModal('editarVentaModal');
            } else {
                showError('No se pudo cargar la venta para editar.');
            }
        } catch (error) {
            console.error('Error al editar venta:', error);
            showError('Error al cargar la venta para editar.');
        }
    };

    window.eliminarVenta = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta venta?')) return;

        try {
            const response = await API.Egreso.delete(id);
            if (response.success || response.status === 204) {
                showSuccess('Venta eliminada exitosamente.');
                await cargarVentas();
            } else {
                showError('Error al eliminar la venta.');
            }
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            showError('Error al eliminar la venta.');
        }
    };

    async function cargarSelectoresFiltros() {
        const clientesResponse = await API.Cliente.getAll();
        if (clientesResponse.success && filtroCliente) {
            filtroCliente.innerHTML = '<option value="">Todos</option>' +
                clientesResponse.data.map(c => `<option value="${c.idCliente}">${c.nombreEmpresa}</option>`).join('');
        }
    }

    async function cargarSelectoresNuevaVenta() {
        // Cargar bodegas para el modal
        const bodegasResponse = await API.Bodega.getAll();
        const bodegaSelect = document.getElementById('bodegaNuevaVenta');
        if (bodegasResponse.success && bodegaSelect) {
            bodegaSelect.innerHTML = '<option value="">Seleccione una bodega</option>' +
                bodegasResponse.data.map(b => `<option value="${b.idBodega}">${b.nombre}</option>`).join('');
        }
    }
    
    // Exportar función para botones-globales.js
    window.cargarSelectoresNuevaVenta = cargarSelectoresNuevaVenta;

    async function guardarNuevaVenta() {
        try {
            // Obtener cliente seleccionado (desde modales-compra-venta.js)
            let cliente = null;
            let items = [];
            
            if (typeof window.getClienteSeleccionadoVenta === 'function') {
                cliente = window.getClienteSeleccionadoVenta();
            }
            if (typeof window.getItemsVenta === 'function') {
                items = window.getItemsVenta();
            }
            
            console.log('🔍 Datos para guardar venta:', { cliente, items: items.length });
            
            if (!cliente) {
                showError('Por favor seleccione un cliente.');
                return;
            }
            
            if (items.length === 0) {
                showError('Por favor agregue al menos un material.');
                return;
            }

            const bodegaSelect = document.getElementById('bodegaNuevaVenta');
            const bodegaId = bodegaSelect?.value;
            if (!bodegaId) {
                showError('Por favor seleccione una bodega de origen.');
                return;
            }

            // Construir detalles de la venta
            let totalVendido = 0;
            const detalles = [];
            
            for (const item of items) {
                if (!item.material || !item.material.idMaterial) {
                    showError('Error: Material inválido en la lista.');
                    return;
                }
                
                if (!item.cantidad || item.cantidad <= 0) {
                    showError(`La cantidad del material ${item.material.nombre} debe ser mayor a 0.`);
                    return;
                }

                if (!item.precioPorKg || item.precioPorKg <= 0) {
                    showError(`El precio por kg del material ${item.material.nombre} debe ser mayor a 0.`);
                    return;
                }

                const cantidad = parseFloat(item.cantidad) || 0;
                const precioKgVenta = parseFloat(item.precioPorKg) || 0;
                totalVendido += cantidad * precioKgVenta;
                detalles.push({
                    material: { idMaterial: item.material.idMaterial },
                    bodegaOrigen: { idBodega: parseInt(bodegaId) },
                    cantidad: cantidad,
                    precioKgVenta: precioKgVenta
                });
            }

            const nuevoEgreso = {
                fecha: new Date().toISOString(),
                totalVendido: totalVendido,
                cliente: { idCliente: cliente.idCliente },
                detalles: detalles
            };
            
            console.log('💾 Guardando venta:', nuevoEgreso);

            const response = await API.Egreso.create(nuevoEgreso);

            if (response.success) {
                showSuccess('Venta guardada exitosamente.');
                window.closeModal('nuevaVentaModal');
                
                // Limpiar formulario usando funciones globales
                if (window.clearItemsVenta) window.clearItemsVenta();
                
                // Recargar ventas
                await cargarVentas();
            } else {
                showError(response.message || 'Error al guardar la venta.');
            }
        } catch (error) {
            console.error('Error al guardar venta:', error);
            showError('Error al guardar la venta: ' + (error.message || 'Error desconocido'));
        }
    }

    function applyCurrentFiltersAndRender() {
        let filtered = [...ventas];

        const searchTerm = searchInput?.value?.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(v => 
                (v.cliente?.nombreEmpresa || '').toLowerCase().includes(searchTerm) ||
                (v.cliente?.nit || '').includes(searchTerm)
            );
        }

        const fechaDesde = fechaDesdeInput?.value || '';
        const fechaHasta = fechaHastaInput?.value || '';
        if (fechaDesde || fechaHasta) {
            filtered = filtered.filter(v => {
                if (!v.fecha) return false;
                const fechaVenta = new Date(v.fecha);
                
                if (fechaDesde) {
                    const desde = new Date(fechaDesde.split('/').reverse().join('-'));
                    if (fechaVenta < desde) return false;
                }
                
                if (fechaHasta) {
                    const hasta = new Date(fechaHasta.split('/').reverse().join('-'));
                    hasta.setHours(23, 59, 59, 999);
                    if (fechaVenta > hasta) return false;
                }
                
                return true;
            });
        }

        const clienteId = filtroCliente?.value || '';
        if (clienteId) {
            filtered = filtered.filter(v => v.cliente?.idCliente == clienteId);
        }

        renderTable(filtered);
    }

    function inicializarEventos() {
        console.log('🔧 Inicializando eventos de ventas...');
        
        // Botón nueva venta - buscar nuevamente por si no estaba disponible antes
        btnNuevaVenta = document.getElementById("btnNuevaVenta");
        
        if (btnNuevaVenta) {
            console.log('✅ Botón btnNuevaVenta encontrado, agregando event listener');
            
            // Remover listener anterior si existe (clonar el botón)
            const nuevoBtn = btnNuevaVenta.cloneNode(true);
            btnNuevaVenta.parentNode.replaceChild(nuevoBtn, btnNuevaVenta);
            btnNuevaVenta = nuevoBtn;
            
            btnNuevaVenta.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Click en botón Nueva Venta');
                
                editVentaId = null;
                
                // Asegurar que el modal esté cargado
                let modal = document.getElementById('nuevaVentaModal');
                if (!modal && window.cargarModalVenta) {
                    console.log('📦 Cargando modal nuevaVentaModal...');
                    await window.cargarModalVenta('nuevaVentaModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaVentaModal');
                }
                
                if (!modal) {
                    console.error('❌ No se pudo cargar el modal nuevaVentaModal');
                    if (typeof showError === 'function') {
                        showError('No se pudo cargar el formulario. Por favor, recargue la página.');
                    } else {
                        alert('No se pudo cargar el formulario. Por favor, recargue la página.');
                    }
                    return;
                }
                
                // Limpiar formulario usando funciones globales
                if (window.clearItemsVenta) window.clearItemsVenta();
                
                const searchCliente = document.getElementById('searchClienteVenta');
                const searchMaterial = document.getElementById('searchMaterialVenta');
                const bodegaSelect = document.getElementById('bodegaNuevaVenta');
                if (searchCliente) searchCliente.value = '';
                if (searchMaterial) searchMaterial.value = '';
                if (bodegaSelect) bodegaSelect.value = '';
                
                // Cargar selectores
                await cargarSelectoresNuevaVenta();
                
                // Inicializar modal de venta si existe modales-compra-venta.js
                if (typeof window.inicializarModalesCompraVenta === 'function') {
                    window.inicializarModalesCompraVenta();
                } else if (typeof inicializarModalVenta === 'function') {
                    setTimeout(async () => {
                        await inicializarModalVenta();
                    }, 500);
                }
                
                console.log('🔓 Abriendo modal nuevaVentaModal');
                if (typeof window.openModal === 'function') {
                    window.openModal('nuevaVentaModal');
                } else {
                    modal.style.display = 'flex';
                    modal.classList.add('active');
                }
            });
        } else {
            console.error('❌ Botón btnNuevaVenta NO encontrado');
        }
        
        // Event listener delegado como respaldo (captura clicks incluso si el botón no se encontró inicialmente)
        document.addEventListener('click', async (e) => {
            // Verificar si el click fue en el botón o dentro de él
            if (e.target.closest && (e.target.closest('#btnNuevaVenta') || e.target.id === 'btnNuevaVenta')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Si ya hay un listener activo, no hacer nada (evitar doble ejecución)
                if (e.target.dataset.procesado) return;
                e.target.dataset.procesado = 'true';
                setTimeout(() => delete e.target.dataset.procesado, 1000);
                
                console.log('🖱️ Click en botón Nueva Venta (delegado)');
                
                editVentaId = null;
                
                let modal = document.getElementById('nuevaVentaModal');
                if (!modal && window.cargarModalVenta) {
                    await window.cargarModalVenta('nuevaVentaModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaVentaModal');
                }
                
                if (modal && typeof window.openModal === 'function') {
                    window.openModal('nuevaVentaModal');
                } else if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('active');
                }
            }
        });

        // Botón guardar nueva venta
        document.addEventListener('click', async (e) => {
            if (e.target.closest && e.target.closest('#btnGuardarNuevaVenta')) {
                e.preventDefault();
                e.stopPropagation();
                
                await guardarNuevaVenta();
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', applyCurrentFiltersAndRender);
        }

        document.querySelectorAll('.filter-actions .btn-apply').forEach(btn => {
            btn.addEventListener('click', applyCurrentFiltersAndRender);
        });

        document.querySelectorAll('.filter-actions .btn-clear').forEach(btn => {
            btn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (fechaDesdeInput) fechaDesdeInput.value = '';
                if (fechaHastaInput) fechaHastaInput.value = '';
                if (filtroCliente) filtroCliente.value = '';
                applyCurrentFiltersAndRender();
            });
        });
    }

    inicializarReferencias();
    
    // Esperar a que el DOM esté completamente listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await cargarSelectoresFiltros();
            await cargarVentas();
            inicializarEventos();
        });
    } else {
        // El DOM ya está listo, pero esperar un momento para asegurar que todos los scripts se hayan cargado
        setTimeout(async () => {
            await cargarSelectoresFiltros();
            await cargarVentas();
            inicializarEventos();
        }, 100);
    }
    */
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarVentas);
} else {
    inicializarVentas();
}

