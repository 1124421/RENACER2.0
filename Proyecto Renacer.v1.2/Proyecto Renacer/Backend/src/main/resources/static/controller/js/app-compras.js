// app-compras.js
// Gestión completa de Compras (EncabezadoIngreso)

// Verificar que la API esté disponible
if (typeof window.API === 'undefined' && typeof API === 'undefined') {
    console.error('❌ API module no está cargado. Asegúrate de incluir api.js antes de este script.');
}

let comprasInicializado = false;

// Declarar función globalmente antes de inicializarCompras
let guardarNuevaCompraFn = null;

async function inicializarCompras() {
    if (comprasInicializado) return;
    comprasInicializado = true;

    let compras = [];
    const tbody = document.getElementById("comprasTbody");

    // Referencias a elementos
    let btnNuevaCompra, searchInput, fechaDesdeInput, fechaHastaInput, filtroAsociado, filtroBarrio;
    let editCompraId = null;

    // Inicializar referencias
    function inicializarReferencias() {
        btnNuevaCompra = document.getElementById("btnNuevaCompra");
        searchInput = document.getElementById("searchInput");
        fechaDesdeInput = document.getElementById("fechaDesdeCompra");
        fechaHastaInput = document.getElementById("fechaHastaCompra");
        filtroAsociado = document.getElementById("filtroAsociado");
        filtroBarrio = document.getElementById("filtroBarrio");
        
        // Configurar botones tipo tabs
        const btnVerCompras = document.getElementById('btnVerCompras');
        const nuevaCompraSection = document.getElementById('nuevaCompraSection');
        const verComprasSection = document.getElementById('verComprasSection');
        
        // Función para cambiar entre secciones
        async function showSection(sectionName) {
            // Remover active de todos los botones
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Ocultar todas las secciones
            if (nuevaCompraSection) nuevaCompraSection.style.display = 'none';
            if (verComprasSection) verComprasSection.style.display = 'none';
            
            // Mostrar la sección seleccionada y activar el botón
            if (sectionName === 'nuevaCompra') {
                if (btnNuevaCompra) btnNuevaCompra.classList.add('active');
                if (nuevaCompraSection) {
                    nuevaCompraSection.style.display = 'block';
                    // Scroll suave hacia la sección
                    setTimeout(() => {
                        nuevaCompraSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
                // Inicializar modal de compra si es necesario (para búsquedas y funcionalidades)
                if (typeof window.inicializarModalesCompraVenta === 'function') {
                    window.inicializarModalesCompraVenta();
                } else if (typeof inicializarModalCompra === 'function') {
                    setTimeout(async () => {
                        await inicializarModalCompra();
                    }, 500);
                }
            } else if (sectionName === 'verCompras') {
                if (btnVerCompras) btnVerCompras.classList.add('active');
                if (verComprasSection) verComprasSection.style.display = 'block';
                // Cargar compras al mostrar esta sección
                if (typeof window.cargarCompras === 'function') {
                    await window.cargarCompras();
                }
            }
        }
        
        // Exportar función showSection globalmente
        window.showSectionCompras = showSection;
        
        // Event listeners para los botones (usar capture phase para tener prioridad sobre botones-globales.js)
        if (btnNuevaCompra) {
            btnNuevaCompra.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🖱️ Click en Nueva Compra - desde app-compras.js');
                await showSection('nuevaCompra');
            }, true); // Usar capture phase para ejecutar antes que botones-globales.js
        }
        
        if (btnVerCompras) {
            btnVerCompras.addEventListener('click', async () => {
                await showSection('verCompras');
            });
        }
        
        // Botón cancelar compra
        const btnCancelarCompra = document.getElementById('btnCancelarCompra');
        if (btnCancelarCompra) {
            btnCancelarCompra.addEventListener('click', () => {
                // Limpiar formulario
                if (window.clearItemsCompra) window.clearItemsCompra();
                const searchAsociado = document.getElementById('searchAsociadoCompra');
                const searchMaterial = document.getElementById('searchMaterialCompra');
                if (searchAsociado) searchAsociado.value = '';
                if (searchMaterial) searchMaterial.value = '';
                // Ocultar información del asociado
                const asociadoInfo = document.getElementById('asociadoSeleccionadoInfo');
                if (asociadoInfo) asociadoInfo.style.display = 'none';
                // Cambiar a Ver Compras
                showSection('verCompras');
            });
        }
        
        // Por defecto mostrar "Ver Compras" al cargar
        setTimeout(() => {
            if (btnVerCompras) {
                showSection('verCompras');
            }
        }, 100);

        // Inicializar Flatpickr
        if (typeof flatpickr !== 'undefined') {
            flatpickr(fechaDesdeInput, { locale: 'es', dateFormat: 'd/m/Y' });
            flatpickr(fechaHastaInput, { locale: 'es', dateFormat: 'd/m/Y' });
        }
    }

    // Cargar compras desde la API
    window.cargarCompras = async () => {
        try {
            // Mostrar mensaje de carga
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">Cargando compras...</td></tr>';
            }
            
            const api = window.API || API;
            if (!api || !api.Ingreso) {
                throw new Error('API module no está disponible');
            }
            
            const response = await api.Ingreso.getAll().catch((err) => {
                console.error('Error en petición API:', err);
                return { success: false, error: err };
            });
            
            // Manejar diferentes formatos de respuesta
            if (response && response.success) {
                compras = response.data || [];
            } else if (Array.isArray(response)) {
                // Si la respuesta es directamente un array
                compras = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                compras = response.data;
            } else {
                compras = [];
                console.warn('⚠️ Respuesta de API no válida:', response);
            }
            
            console.log('✅ Compras cargadas:', compras.length);
            applyCurrentFiltersAndRender();
            
        } catch (error) {
            console.error('❌ Error al cargar compras:', error);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #ef4444;">Error al cargar las compras. Por favor, recarga la página.</td></tr>';
            }
            if (typeof showError === 'function') {
                showError('Error al cargar las compras.');
            }
        }
    };

    // Renderizar tabla
    function renderTable(list = null) {
        const data = Array.isArray(list) ? list : compras;
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No hay compras registradas</td></tr>';
            return;
        }

        data.forEach((compra) => {
            const tr = document.createElement('tr');
            const fecha = compra.fecha ? (window.formatFechaColombiana ? window.formatFechaColombiana(compra.fecha, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date(compra.fecha).toLocaleString('es-CO', { 
                timeZone: 'America/Bogota',
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })) : 'N/A';
            const asociado = compra.asociado ? `${compra.asociado.nombre || ''} ${compra.asociado.apellido || ''}`.trim() || 'N/A' : 'N/A';
            const documento = compra.asociado ? compra.asociado.documento : 'N/A';
            const barrio = compra.barrio ? compra.barrio.nombre : 'N/A';
            // Carreta - obtener valor correcto
            let carreta = '';
            if (compra.carreta !== null && compra.carreta !== undefined && compra.carreta !== '') {
                carreta = compra.carreta.toString().trim();
            } else if (compra.asociado?.carreta !== null && compra.asociado?.carreta !== undefined && compra.asociado?.carreta !== '') {
                carreta = compra.asociado.carreta.toString().trim();
            }
            
            // Formatear materiales con cantidad y precio (mostrar solo los primeros 3)
            let materiales = 'N/A';
            if (compra.detalles && compra.detalles.length > 0) {
                const materialesMostrados = compra.detalles.slice(0, 3);
                const materialesTexto = materialesMostrados.map(d => {
                    const nombreMaterial = d.material?.nombreMaterial?.nombre || d.material?.nombre || 'N/A';
                    const cantidad = d.cantidad ? parseFloat(d.cantidad).toFixed(2) : '0';
                    const precio = d.precioPorKg ? parseFloat(d.precioPorKg).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0';
                    return `${nombreMaterial} (${cantidad} kg)`;
                });
                
                materiales = materialesTexto.join('<br>');
                if (compra.detalles.length > 3) {
                    materiales += `<br><span style="color: #666; font-size: 0.9em;">+${compra.detalles.length - 3} más...</span>`;
                }
            }
            
            const total = compra.totalPagado ? parseFloat(compra.totalPagado).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

            tr.innerHTML = `
                <td>${compra.idIngreso || ''}</td>
                <td>${fecha}</td>
                <td>${asociado}</td>
                <td>${documento}</td>
                <td>${barrio}</td>
                <td>${carreta || 'N/A'}</td>
                <td style="max-width: 300px; word-wrap: break-word;">${materiales}</td>
                <td>$${total}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" onclick="window.verCompra(${compra.idIngreso})" title="Ver">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="window.editarCompra(${compra.idIngreso})" title="Editar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="window.eliminarCompra(${compra.idIngreso})" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Funciones de acción
    window.verCompra = async (id) => {
        try {
            console.log('🔍 Ver compra - ID:', id);
            
            // Asegurar que el modal esté cargado
            let modal = document.getElementById('modalVerCompra');
            if (!modal && typeof window.cargarModalCompra === 'function') {
                console.log('📦 Cargando modal modalVerCompra...');
                await window.cargarModalCompra('modalVerCompra');
                await new Promise(resolve => setTimeout(resolve, 500));
                modal = document.getElementById('modalVerCompra');
            }
            
            if (!modal) {
                console.error('❌ Modal modalVerCompra no encontrado');
                if (typeof showError === 'function') {
                    showError('No se pudo cargar el modal. Por favor, recargue la página.');
                }
                return;
            }
            
            // Obtener datos de la API
            const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
            if (!apiInstance || !apiInstance.Ingreso) {
                throw new Error('API module no está disponible');
            }
            const response = await apiInstance.Ingreso.getById(id);
            console.log('📦 Respuesta de API (ver):', response);
            
            // El API puede retornar directamente el objeto o dentro de response
            let compra = null;
            if (response && response.idIngreso) {
                compra = response;
            } else if (response && response.success && response.data) {
                compra = response.data;
            } else if (response && response.data && response.data.idIngreso) {
                compra = response.data;
            } else if (Array.isArray(response) && response.length > 0 && response[0].idIngreso === id) {
                compra = response[0];
            }
            
            console.log('📋 Compra procesada:', compra);
            
            if (!compra) {
                console.error('❌ Compra es null o undefined. Respuesta completa:', response);
                if (typeof showError === 'function') {
                    showError('No se pudo cargar la compra. Por favor, verifique la consola para más detalles.');
                }
                return;
            }
            
            // Función para esperar elemento con más intentos
            const esperarElemento = (id, maxIntentos = 20) => {
                return new Promise((resolve) => {
                    let intentos = 0;
                    const intervalo = setInterval(() => {
                        const elemento = document.getElementById(id);
                        if (elemento) {
                            clearInterval(intervalo);
                            console.log(`✅ Elemento encontrado: ${id}`);
                            resolve(elemento);
                        } else if (intentos >= maxIntentos) {
                            clearInterval(intervalo);
                            console.error(`❌ Elemento no encontrado después de ${maxIntentos} intentos: ${id}`);
                            resolve(null);
                        }
                        intentos++;
                    }, 100);
                });
            };
            
                // Esperar a que todos los elementos estén disponibles
                console.log('⏳ Esperando elementos del modal...');
                const elementos = await Promise.all([
                    esperarElemento('viewCompraId'),
                    esperarElemento('viewCompraFecha'),
                    esperarElemento('viewCompraAsociado'),
                    esperarElemento('viewCompraDocumento'),
                    esperarElemento('viewCompraBarrio'),
                    esperarElemento('viewCompraCarreta'),
                    esperarElemento('viewCompraTotal'),
                    esperarElemento('viewCompraDetalles')
                ]);
            
            // Verificar que todos los elementos críticos existan
                const viewCompraId = elementos[0];
                const viewCompraFecha = elementos[1];
                const viewCompraAsociado = elementos[2];
                const viewCompraDocumento = elementos[3];
                const viewCompraBarrio = elementos[4];
                const viewCompraCarreta = elementos[5];
                const viewCompraTotal = elementos[6];
                const detallesTbody = elementos[7];
            
            if (!viewCompraId || !viewCompraFecha || !viewCompraAsociado) {
                console.error('❌ Elementos críticos del modal no encontrados');
                if (typeof showError === 'function') {
                    showError('Error al cargar el formulario. Por favor, recargue la página.');
                }
                return;
            }
            
            // Llenar datos del modal
            console.log('📝 Llenando datos del modal...');
            
            // ID
            viewCompraId.textContent = compra.idIngreso || 'N/A';
            console.log('✅ ID llenado:', viewCompraId.textContent);
            
            // Fecha
            const fecha = compra.fecha ? (window.formatFechaColombiana ? window.formatFechaColombiana(compra.fecha, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date(compra.fecha).toLocaleString('es-CO', {
                timeZone: 'America/Bogota',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })) : 'N/A';
            viewCompraFecha.textContent = fecha;
            console.log('✅ Fecha llenada:', fecha);
            
            // Asociado
            const asociadoNombre = compra.asociado ? `${compra.asociado.nombre || ''} ${compra.asociado.apellido || ''}`.trim() || 'N/A' : 'N/A';
            viewCompraAsociado.textContent = asociadoNombre;
            console.log('✅ Asociado llenado:', asociadoNombre);
            
            // Documento
            if (viewCompraDocumento) {
                viewCompraDocumento.textContent = compra.asociado ? compra.asociado.documento : 'N/A';
                console.log('✅ Documento llenado:', viewCompraDocumento.textContent);
            }
            
            // Barrio
            if (viewCompraBarrio) {
                viewCompraBarrio.textContent = compra.barrio ? compra.barrio.nombre : 'N/A';
                console.log('✅ Barrio llenado:', viewCompraBarrio.textContent);
            }
            
            // Carreta
            if (viewCompraCarreta) {
                let carretaValue = '';
                // Intentar obtener de compra.carreta primero
                if (compra.carreta !== null && compra.carreta !== undefined && compra.carreta !== '') {
                    carretaValue = compra.carreta.toString().trim();
                } 
                // Si no hay, intentar del asociado
                else if (compra.asociado?.carreta !== null && compra.asociado?.carreta !== undefined && compra.asociado?.carreta !== '') {
                    carretaValue = compra.asociado.carreta.toString().trim();
                }
                viewCompraCarreta.textContent = carretaValue || 'N/A';
                console.log('✅ Carreta llenada:', viewCompraCarreta.textContent, 'Valor original compra.carreta:', compra.carreta, 'asociado.carreta:', compra.asociado?.carreta);
            }
            
            // Total
            if (viewCompraTotal) {
                const total = compra.totalPagado ? parseFloat(compra.totalPagado).toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 2
                }) : '$0.00';
                viewCompraTotal.textContent = total;
                console.log('✅ Total llenado:', total);
            }
            
            // Detalles - mostrar TODOS los materiales
            if (detallesTbody) {
                    if (compra.detalles && Array.isArray(compra.detalles) && compra.detalles.length > 0) {
                        console.log('📋 Detalles de la compra:', compra.detalles);
                        detallesTbody.innerHTML = compra.detalles.map((d, index) => {
                            const nombreMaterial = d.material?.nombreMaterial?.nombre || d.material?.nombre || 'N/A';
                            const cantidad = d.cantidad ? parseFloat(d.cantidad).toFixed(2) : '0.00';
                            const precioPorKg = d.precioPorKg ? parseFloat(d.precioPorKg).toFixed(2) : '0.00';
                            const subtotal = (parseFloat(cantidad) * parseFloat(precioPorKg)).toFixed(2);
                            const bodega = d.bodegaDestino?.nombre || 'N/A';
                            const rowStyle = index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;';
                            
                            return `
                                <tr style="${rowStyle}">
                                    <td style="padding: 16px; color: #1f2937; font-weight: 500; font-size: 1rem;">${nombreMaterial}</td>
                                    <td style="padding: 16px; text-align: right; color: #374151; font-size: 1rem;">${cantidad} Kg</td>
                                    <td style="padding: 16px; text-align: right; color: #374151; font-size: 1rem;">$${parseFloat(precioPorKg).toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
                                    <td style="padding: 16px; color: #6b7280; font-size: 1rem;">${bodega}</td>
                                    <td style="padding: 16px; text-align: right; color: #2d5a47; font-weight: 600; font-size: 1rem;">$${parseFloat(subtotal).toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
                                </tr>
                            `;
                        }).join('');
                    console.log('✅ Detalles llenados:', compra.detalles.length, 'materiales');
                    } else {
                        console.warn('⚠️ No hay detalles en la compra');
                        detallesTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #6b7280; background: #f9fafb;">No hay detalles registrados</td></tr>';
                    }
            } else {
                console.error('❌ detallesTbody no encontrado');
            }

            // Pequeño delay para asegurar que el DOM se actualizó
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('✅ Todos los datos del modal llenados correctamente');
            
            // Forzar visibilidad de todos los elementos
            const elementosParaVerificar = [
                viewCompraId, viewCompraFecha, viewCompraAsociado, 
                viewCompraDocumento, viewCompraBarrio, viewCompraCarreta, viewCompraTotal
            ];
            
            elementosParaVerificar.forEach((el, index) => {
                if (el) {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.height = 'auto';
                    el.style.minHeight = '20px';
                    console.log(`✅ Visibilidad forzada para elemento ${index}:`, el.id, el.textContent);
                }
            });
            
            // Verificar que los datos estén visibles antes de abrir
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.display = 'block';
                modalBody.style.visibility = 'visible';
                modalBody.style.opacity = '1';
                modalBody.style.height = 'auto';
                modalBody.style.minHeight = '200px';
                console.log('✅ Modal body visible');
            }
            
            // Forzar visibilidad de form-sections
            const formSections = modal.querySelectorAll('.form-section');
            formSections.forEach((section, index) => {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                console.log(`✅ Form section ${index} visible`);
            });
            
            // Abrir el modal después de llenar los datos
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (typeof window.openModal === 'function') {
                window.openModal('modalVerCompra');
            } else {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
            
            // Verificar contenido después de abrir
            setTimeout(() => {
                console.log('🔍 Verificación final de contenido:');
                console.log('  - viewCompraId:', viewCompraId?.textContent, viewCompraId?.offsetHeight);
                console.log('  - viewCompraFecha:', viewCompraFecha?.textContent, viewCompraFecha?.offsetHeight);
                console.log('  - viewCompraAsociado:', viewCompraAsociado?.textContent, viewCompraAsociado?.offsetHeight);
                console.log('  - Modal body height:', modalBody?.offsetHeight);
            }, 200);
            
            console.log('✅ Modal abierto');
            
        } catch (error) {
            console.error('❌ Error al ver compra:', error);
            if (typeof showError === 'function') {
                showError('Error al cargar la compra: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    window.editarCompra = async (id) => {
        try {
            console.log('✏️ Editar compra - ID:', id);
            
            // Asegurar que el modal esté cargado
            let modal = document.getElementById('editarCompraModal');
            if (!modal && typeof window.cargarModalCompra === 'function') {
                console.log('📦 Cargando modal editarCompraModal...');
                await window.cargarModalCompra('editarCompraModal');
                await new Promise(resolve => setTimeout(resolve, 500));
                modal = document.getElementById('editarCompraModal');
            }
            
            if (!modal) {
                console.error('❌ Modal editarCompraModal no encontrado');
                if (typeof showError === 'function') {
                    showError('No se pudo cargar el modal. Por favor, recargue la página.');
                }
                return;
            }
            
            const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
            if (!apiInstance || !apiInstance.Ingreso) {
                throw new Error('API module no está disponible');
            }
            const response = await apiInstance.Ingreso.getById(id);
            console.log('📦 Respuesta de API (editar):', response);
            
            // El API puede retornar directamente el objeto o dentro de response
            let compra = null;
            if (response && response.idIngreso) {
                // Si tiene idIngreso, es directamente el objeto
                compra = response;
            } else if (response && response.success && response.data) {
                // Si tiene formato {success: true, data: {...}}
                compra = response.data;
            } else if (response && response.data && response.data.idIngreso) {
                // Si está en response.data
                compra = response.data;
            } else if (Array.isArray(response) && response.length > 0 && response[0].idIngreso === id) {
                // Si es un array y el primer elemento coincide
                compra = response[0];
            }
            
            console.log('📋 Compra procesada (editar):', compra);
            
            if (!compra) {
                console.error('❌ Compra es null o undefined para editar. Respuesta completa:', response);
                if (typeof showError === 'function') {
                    showError('No se pudo cargar la compra para editar. Por favor, verifique la consola para más detalles.');
                }
                return;
            }
            
            editCompraId = id;

            // Función para esperar elemento
            const esperarElemento = (id, maxIntentos = 20) => {
                return new Promise((resolve) => {
                    let intentos = 0;
                    const intervalo = setInterval(() => {
                        const elemento = document.getElementById(id);
                        if (elemento) {
                            clearInterval(intervalo);
                            console.log(`✅ Elemento encontrado: ${id}`);
                            resolve(elemento);
                        } else if (intentos >= maxIntentos) {
                            clearInterval(intervalo);
                            console.error(`❌ Elemento no encontrado después de ${maxIntentos} intentos: ${id}`);
                            resolve(null);
                        }
                        intentos++;
                    }, 100);
                });
            };
            
            // Cargar selectores primero
            console.log('⏳ Cargando selectores de edición...');
            await cargarSelectoresEdicion();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Esperar a que los elementos estén disponibles
            console.log('⏳ Esperando elementos del modal de edición...');
            const elementos = await Promise.all([
                esperarElemento('editAsociadoCompra'),
                esperarElemento('editBarrioCompra'),
                esperarElemento('editCarretaCompra'),
                esperarElemento('editDetallesCompra')
            ]);

            const editAsociado = elementos[0];
            const editBarrio = elementos[1];
            const editCarreta = elementos[2];
            const detallesContainer = elementos[3];
            
            if (!editAsociado || !editBarrio || !editCarreta || !detallesContainer) {
                console.error('❌ Elementos críticos del modal de edición no encontrados');
                if (typeof showError === 'function') {
                    showError('Error al cargar el formulario de edición. Por favor, recargue la página.');
                }
                return;
            }

            // Establecer valores
            console.log('📝 Llenando datos del formulario de edición...');
            
            if (compra.asociado && compra.asociado.idAsociado) {
                editAsociado.value = compra.asociado.idAsociado;
                console.log('✅ Asociado seleccionado:', compra.asociado.idAsociado);
            }
            
            if (compra.barrio && compra.barrio.idBarrio) {
                editBarrio.value = compra.barrio.idBarrio;
                console.log('✅ Barrio seleccionado:', compra.barrio.idBarrio);
            }
            
            // Carreta - mostrar el valor correcto
            let carretaValue = '';
            if (compra.carreta !== null && compra.carreta !== undefined && compra.carreta !== '') {
                carretaValue = compra.carreta.toString().trim();
            } else if (compra.asociado?.carreta !== null && compra.asociado?.carreta !== undefined && compra.asociado?.carreta !== '') {
                carretaValue = compra.asociado.carreta.toString().trim();
            }
            editCarreta.value = carretaValue;
            console.log('✅ Carreta llenada:', editCarreta.value, 'Valor original:', compra.carreta, compra.asociado?.carreta);

            // Detalles
            detallesContainer.innerHTML = '';
            
            if (compra.detalles && Array.isArray(compra.detalles) && compra.detalles.length > 0) {
                console.log('📋 Detalles para edición:', compra.detalles);
                compra.detalles.forEach((detalle, index) => {
                    agregarDetalleEdicion(detalle);
                    console.log(`✅ Detalle ${index + 1} agregado`);
                });
                console.log('✅ Todos los detalles agregados:', compra.detalles.length);
            } else {
                console.warn('⚠️ No hay detalles en la compra para editar');
                detallesContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; margin: 0;">No hay detalles para mostrar</p>';
            }

            // Pequeño delay para asegurar que el DOM se actualizó
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('✅ Todos los datos del modal de edición llenados correctamente');
            
            // Forzar visibilidad de todos los elementos
            const elementosParaVerificar = [editAsociado, editBarrio, editCarreta, detallesContainer];
            
            elementosParaVerificar.forEach((el, index) => {
                if (el) {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.height = 'auto';
                    el.style.minHeight = '40px';
                    console.log(`✅ Visibilidad forzada para elemento ${index}:`, el.id, el.value || el.innerHTML.substring(0, 50));
                }
            });
            
            // Verificar que los datos estén visibles antes de abrir
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.style.display = 'block';
                modalBody.style.visibility = 'visible';
                modalBody.style.opacity = '1';
                modalBody.style.height = 'auto';
                modalBody.style.minHeight = '200px';
                console.log('✅ Modal body visible');
            }
            
            // Forzar visibilidad de form-sections
            const formSections = modal.querySelectorAll('.form-section');
            formSections.forEach((section, index) => {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                console.log(`✅ Form section ${index} visible`);
            });
            
            // Abrir el modal después de llenar los datos
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (typeof window.openModal === 'function') {
                window.openModal('editarCompraModal');
            } else {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
            
            // Verificar contenido después de abrir
            setTimeout(() => {
                console.log('🔍 Verificación final de contenido:');
                console.log('  - editAsociado:', editAsociado?.value, editAsociado?.offsetHeight);
                console.log('  - editBarrio:', editBarrio?.value, editBarrio?.offsetHeight);
                console.log('  - editCarreta:', editCarreta?.value, editCarreta?.offsetHeight);
                console.log('  - detallesContainer:', detallesContainer?.children.length, detallesContainer?.offsetHeight);
                console.log('  - Modal body height:', modalBody?.offsetHeight);
            }, 200);
            
            console.log('✅ Modal de edición abierto');
        } catch (error) {
            console.error('Error al editar compra:', error);
            if (typeof showError === 'function') {
                showError('Error al cargar la compra para editar: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    window.eliminarCompra = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta compra?')) return;

        try {
            const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
            if (!apiInstance || !apiInstance.Ingreso) {
                throw new Error('API module no está disponible');
            }
            
            const response = await apiInstance.Ingreso.delete(id);
            
            // Manejar diferentes formatos de respuesta
            if (response === null || response === undefined || response.success === true || response.status === 204 || response === '') {
                showSuccess('Compra eliminada exitosamente.');
                if (typeof window.cargarCompras === 'function') {
                    await window.cargarCompras();
                }
            } else {
                showError('Error al eliminar la compra.');
            }
        } catch (error) {
            console.error('Error al eliminar compra:', error);
            showError('Error al eliminar la compra: ' + (error.message || 'Error desconocido'));
        }
    };

    // Funciones de filtros
    async function cargarSelectoresFiltros() {
        // Cargar asociados
        const asociadosResponse = await API.Asociado.getAll();
        if (asociadosResponse.success && filtroAsociado) {
            filtroAsociado.innerHTML = '<option value="">Todos</option>' +
                asociadosResponse.data.map(a => {
                    const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`.trim() || 'N/A';
                    return `<option value="${a.idAsociado}">${nombreCompleto}</option>`;
                }).join('');
        }

        // Cargar barrios
        const barriosResponse = await API.Barrio.getAll();
        if (barriosResponse.success && filtroBarrio) {
            filtroBarrio.innerHTML = '<option value="">Todos</option>' +
                barriosResponse.data.map(b => `<option value="${b.idBarrio}">${b.nombre}</option>`).join('');
        }
    }

    async function cargarSelectoresNuevaCompra() {
        // Cargar barrios para el modal
        const barriosResponse = await API.Barrio.getAll();
        const barrioSelect = document.getElementById('barrioNuevaCompra');
        if (barriosResponse.success && barrioSelect) {
            barrioSelect.innerHTML = '<option value="">Seleccione un barrio</option>' +
                barriosResponse.data.map(b => `<option value="${b.idBarrio}">${b.nombre}</option>`).join('');
        }
    }
    
    // Exportar función para botones-globales.js
    window.cargarSelectoresNuevaCompra = cargarSelectoresNuevaCompra;

    guardarNuevaCompraFn = async function() {
        console.log('🚀 Iniciando guardarNuevaCompra...');
        try {
            // Verificar si hay un usuario sin registrar
            const panelUsuarioSinRegistrar = document.getElementById('panelUsuarioSinRegistrar');
            const esUsuarioSinRegistrar = panelUsuarioSinRegistrar && panelUsuarioSinRegistrar.style.display !== 'none';
            
            // Obtener asociado seleccionado (desde modales-compra-venta.js)
            let asociado = null;
            let items = [];
            
            if (esUsuarioSinRegistrar) {
                // Crear objeto asociado temporal (sin guardar en BD)
                const nombre = document.getElementById('usuarioSinRegistrarNombre')?.value?.trim() || '';
                const apellido = document.getElementById('usuarioSinRegistrarApellido')?.value?.trim() || '';
                const documento = document.getElementById('usuarioSinRegistrarDocumento')?.value?.trim() || '';
                const telefono = document.getElementById('usuarioSinRegistrarTelefono')?.value?.trim() || '';
                
                if (!nombre || !documento) {
                    showError('Por favor ingrese nombre y documento del usuario.');
                    return;
                }
                
                // Crear objeto asociado temporal para la compra
                asociado = {
                    nombre: nombre,
                    apellido: apellido,
                    documento: documento,
                    telefono: telefono || null,
                    idAsociado: null, // Temporal, no guardado
                    esTemporal: true
                };
            } else {
                // Usar asociado inscrito seleccionado
                if (typeof window.getAsociadoSeleccionadoCompra === 'function') {
                    asociado = window.getAsociadoSeleccionadoCompra();
                }
            }
            
            if (typeof window.getItemsCompra === 'function') {
                items = window.getItemsCompra();
            }
            
            console.log('🔍 Datos para guardar compra:', { asociado, items: items.length, esUsuarioSinRegistrar });
            
            if (!asociado) {
                showError('Por favor seleccione un asociado o complete los datos del usuario sin registrar.');
                return;
            }
            
            // Si es usuario sin registrar, necesitamos crear un asociado temporal o usar uno existente por documento
            if (esUsuarioSinRegistrar && asociado.esTemporal) {
                // Buscar si existe un asociado con ese documento
                try {
                    const asociadosRes = await API.Asociado.getAll();
                    const asociados = asociadosRes.success ? asociadosRes.data : (Array.isArray(asociadosRes) ? asociadosRes : []);
                    const asociadoExistente = asociados.find(a => a.documento === asociado.documento);
                    
                    if (asociadoExistente) {
                        // Usar el asociado existente
                        asociado = asociadoExistente;
                    } else {
                        // Crear asociado temporal con ID negativo o usar el primero disponible
                        // O mejor: crear el asociado en la BD
                        const apiTemp = window.API || (typeof API !== 'undefined' ? API : null);
                        const barriosRes = await apiTemp.Barrio.getAll();
                        const barrios = barriosRes.success ? barriosRes.data : (Array.isArray(barriosRes) ? barriosRes : []);
                        const primerBarrio = barrios.length > 0 ? barrios[0] : null;
                        
                        // Crear asociado con ID temporal (usaremos el documento como referencia)
                        // Por ahora, usaremos un ID negativo como marcador temporal
                        asociado.idAsociado = -1; // Temporal
                    }
                } catch (error) {
                    console.error('Error al verificar asociado:', error);
                    // Continuar con asociado temporal
                    asociado.idAsociado = -1;
                }
            }
            
            if (items.length === 0) {
                showError('Por favor agregue al menos un material.');
                return;
            }

            // Obtener barrioId - primero intentar desde el select, luego desde el asociado seleccionado
            let barrioId = null;
            const barrioSelect = document.getElementById('barrioNuevaCompra');
            if (barrioSelect && barrioSelect.value) {
                barrioId = barrioSelect.value;
            } else if (asociado && asociado.barrio && asociado.barrio.idBarrio) {
                // Si el asociado tiene un barrio asignado, usarlo
                barrioId = asociado.barrio.idBarrio;
                console.log('✅ Usando barrio del asociado:', barrioId);
            } else if (asociado && asociado.barrioId) {
                // Si el barrio está como ID directo
                barrioId = asociado.barrioId;
                console.log('✅ Usando barrioId del asociado:', barrioId);
            }
            
            if (!barrioId) {
                showError('Por favor seleccione un barrio/ruta o asegúrese de que el asociado tenga un barrio asignado.');
                return;
            }

            const carreta = document.getElementById('carretaNuevaCompra')?.value?.trim() || '';
            
            // Obtener bodega destino UNA SOLA VEZ fuera del loop
            const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
            if (!apiInstance || !apiInstance.Bodega) {
                showError('Error: API no disponible. Por favor, recargue la página.');
                return;
            }
            
            let bodegasResponse;
            try {
                bodegasResponse = await apiInstance.Bodega.getAll();
                console.log('📦 Respuesta de bodegas:', bodegasResponse);
            } catch (error) {
                console.error('❌ Error al obtener bodegas:', error);
                showError('Error al obtener bodegas. Por favor, intente nuevamente.');
                return;
            }
            
            // Manejar diferentes formatos de respuesta
            let bodegas = [];
            if (Array.isArray(bodegasResponse)) {
                // Si la respuesta es directamente un array
                bodegas = bodegasResponse;
            } else if (bodegasResponse && bodegasResponse.success && Array.isArray(bodegasResponse.data)) {
                // Si la respuesta tiene formato { success: true, data: [...] }
                bodegas = bodegasResponse.data;
            } else if (bodegasResponse && Array.isArray(bodegasResponse)) {
                // Fallback adicional
                bodegas = bodegasResponse;
            }
            
            console.log('📦 Bodegas obtenidas:', bodegas.length, bodegas);
            
            // Si no hay bodegas, intentar crear una por defecto
            if (!bodegas || bodegas.length === 0) {
                console.log('⚠️ No hay bodegas. Intentando crear una bodega por defecto...');
                try {
                    if (!apiInstance.Bodega || typeof apiInstance.Bodega.create !== 'function') {
                        throw new Error('Método create no disponible en Bodega API');
                    }
                    
                    const bodegaDefault = {
                        nombre: 'Bodega Principal',
                        direccion: 'Dirección principal'
                    };
                    const nuevaBodegaResponse = await apiInstance.Bodega.create(bodegaDefault);
                    console.log('✅ Respuesta de creación de bodega:', nuevaBodegaResponse);
                    
                    // Si la creación fue exitosa, usar la bodega creada
                    if (nuevaBodegaResponse && nuevaBodegaResponse.idBodega) {
                        bodegas = [nuevaBodegaResponse];
                        console.log('✅ Bodega por defecto creada exitosamente');
                    } else {
                        // Si la respuesta no tiene idBodega, intentar obtener las bodegas de nuevo
                        console.log('⚠️ La respuesta no contiene idBodega, obteniendo bodegas de nuevo...');
                        const bodegasRefresh = await apiInstance.Bodega.getAll();
                        if (Array.isArray(bodegasRefresh) && bodegasRefresh.length > 0) {
                            bodegas = bodegasRefresh;
                        } else {
                            throw new Error('No se pudo obtener la bodega creada');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error al crear bodega por defecto:', error);
                    showError('No hay bodegas disponibles. Por favor, cree una bodega primero en el módulo de configuración.');
                    return;
                }
            }
            
            // Usar la primera bodega disponible
            const bodegaDestino = bodegas[0];
            if (!bodegaDestino || !bodegaDestino.idBodega) {
                console.error('❌ Bodega inválida:', bodegaDestino);
                showError('Error: La bodega obtenida no es válida. Por favor, verifique la configuración.');
                return;
            }
            
            console.log('✅ Bodega destino seleccionada:', bodegaDestino);
            
            // Construir detalles de la compra
            let totalPagado = 0;
            const detalles = [];
            
            for (const item of items) {
                if (!item.material || !item.material.idMaterial) {
                    showError('Error: Material inválido en la lista.');
                    return;
                }
                
                if (!item.cantidad || item.cantidad <= 0) {
                    showError(`La cantidad del material ${item.material.nombreMaterial || item.material.nombre} debe ser mayor a 0.`);
                    return;
                }

                if (!item.precioPorKg || item.precioPorKg <= 0) {
                    showError(`El precio por kg del material ${item.material.nombreMaterial || item.material.nombre} debe ser mayor a 0.`);
                    return;
                }

                const cantidadItem = parseFloat(item.cantidad) || 0;
                const precioPorKgItem = parseFloat(item.precioPorKg) || 0;
                totalPagado += cantidadItem * precioPorKgItem;
                detalles.push({
                    material: { idMaterial: item.material.idMaterial },
                    bodegaDestino: { idBodega: bodegaDestino.idBodega },
                    cantidad: cantidadItem,
                    precioPorKg: precioPorKgItem
                });
            }

            // Obtener fecha actual en hora colombiana (UTC-5)
            const ahora = new Date();
            // Crear fecha en zona horaria de Colombia
            const fechaColombiana = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
            
            const nuevoIngreso = {
                fecha: fechaColombiana.toISOString(),
                totalPagado: totalPagado,
                asociado: { idAsociado: asociado.idAsociado },
                barrio: { idBarrio: parseInt(barrioId) },
                carreta: carreta || null,
                detalles: detalles
            };
            
            console.log('💾 Guardando compra:', nuevoIngreso);

            if (!apiInstance || !apiInstance.Ingreso) {
                throw new Error('API module no está disponible');
            }
            
            const response = await apiInstance.Ingreso.create(nuevoIngreso);

            if (response.success || response.idIngreso) {
                showSuccess('Compra guardada exitosamente.');
                
                // Cerrar modal
                if (typeof window.closeModal === 'function') {
                    window.closeModal('nuevaCompraModal');
                } else {
                    const modal = document.getElementById('nuevaCompraModal');
                    if (modal) modal.style.display = 'none';
                }
                
                // Limpiar formulario
                itemsCompra = [];
                asociadoSeleccionadoCompra = null;
                if (window.clearItemsCompra) window.clearItemsCompra();
                
                // Limpiar formulario de nueva compra y volver a la vista de compras
                if (typeof window.limpiarFormularioCompra === 'function') {
                    window.limpiarFormularioCompra();
                }
                if (typeof window.showSectionCompras === 'function') {
                    window.showSectionCompras('verCompras');
                }
                
                // Recargar compras para mostrar en la tabla
                await cargarCompras();
                
                // Notificar que se guardó una operación para actualizar el dashboard e informes
                if (typeof window.actualizarActividadReciente === 'function') {
                    window.actualizarActividadReciente();
                }
                window.dispatchEvent(new CustomEvent('operacionGuardada'));
                
                // Si estamos en la página de informes, recargar informes
                if (window.location.pathname.includes('Informe.html') && typeof window.cargarInformes === 'function') {
                    setTimeout(() => {
                        if (window.cargarInformes) window.cargarInformes();
                    }, 500);
                }
                
                console.log('✅ Compra guardada y tabla actualizada');
            } else {
                showError(response.message || 'Error al guardar la compra.');
            }
        } catch (error) {
            console.error('Error al guardar compra:', error);
            showError('Error al guardar la compra: ' + (error.message || 'Error desconocido'));
        }
    }
    
    // Exportar función para que pueda ser llamada desde onclick
    window.guardarNuevaCompra = guardarNuevaCompraFn;
    
    // Agregar listener directo cuando el DOM esté listo
    function agregarListenerBtnFinalizar() {
        const btn = document.getElementById('btnFinalizarCompra');
        if (btn) {
            // Remover listeners anteriores clonando el botón
            const nuevoBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(nuevoBtn, btn);
            
            nuevoBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🔘 CLICK EN BOTÓN FINALIZAR COMPRA - LISTENER DIRECTO');
                
                if (this.dataset.procesando === 'true') {
                    console.log('⚠️ Ya procesando...');
                    return;
                }
                this.dataset.procesando = 'true';
                this.disabled = true;
                
                try {
                    if (typeof window.guardarNuevaCompra === 'function') {
                        await window.guardarNuevaCompra();
                    } else {
                        console.error('❌ window.guardarNuevaCompra no disponible');
                    }
                } catch (error) {
                    console.error('❌ Error:', error);
                } finally {
                    this.dataset.procesando = 'false';
                    this.disabled = false;
                }
            }, true); // Usar capture phase
            
            console.log('✅ Listener directo agregado a btnFinalizarCompra');
        } else {
            console.log('⏳ Botón btnFinalizarCompra no encontrado aún, reintentando...');
            setTimeout(agregarListenerBtnFinalizar, 500);
        }
    }
    
    // Intentar agregar listener inmediatamente y cuando el modal se abra
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', agregarListenerBtnFinalizar);
    } else {
        setTimeout(agregarListenerBtnFinalizar, 500);
    }
    
    // También intentar cuando se abre el modal
    const observer = new MutationObserver(function(mutations) {
        const btn = document.getElementById('btnFinalizarCompra');
        if (btn && !btn.dataset.listenerAdded) {
            btn.dataset.listenerAdded = 'true';
            agregarListenerBtnFinalizar();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    async function cargarSelectoresEdicion() {
        const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
        if (!apiInstance) return;
        
        // Cargar asociados
        try {
            const asociadosResponse = await apiInstance.Asociado.getAll();
            const asociadoSelect = document.getElementById('editAsociadoCompra');
            if (asociadoSelect) {
                const asociados = Array.isArray(asociadosResponse) ? asociadosResponse : (asociadosResponse.success ? asociadosResponse.data : []);
                asociadoSelect.innerHTML = '<option value="">Seleccione un asociado</option>' +
                    asociados.map(a => {
                        const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`.trim() || 'N/A';
                        return `<option value="${a.idAsociado}">${nombreCompleto}</option>`;
                    }).join('');
            }
        } catch (error) {
            console.error('Error al cargar asociados para edición:', error);
        }
        
        // Cargar barrios
        try {
            const barriosResponse = await apiInstance.Barrio.getAll();
            const barrioSelect = document.getElementById('editBarrioCompra');
            if (barrioSelect) {
                const barrios = Array.isArray(barriosResponse) ? barriosResponse : (barriosResponse.success ? barriosResponse.data : []);
                barrioSelect.innerHTML = '<option value="">Seleccione un barrio</option>' +
                    barrios.map(b => `<option value="${b.idBarrio}">${b.nombre}</option>`).join('');
            }
        } catch (error) {
            console.error('Error al cargar barrios para edición:', error);
        }
    }

    function agregarDetalleEdicion(detalle) {
        const detallesContainer = document.getElementById('editDetallesCompra');
        if (!detallesContainer) return;
        
        const detalleDiv = document.createElement('div');
        detalleDiv.className = 'detalle-item';
        detalleDiv.dataset.materialId = detalle.material?.idMaterial || '';
        detalleDiv.dataset.detalleId = detalle.idDetalleIngreso || '';
        detalleDiv.style.cssText = 'border: 1px solid #ddd; padding: 18px; margin: 12px 0; border-radius: 6px; background: #f9fafb;';
        
        const nombreMaterial = detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || 'N/A';
        const cantidad = detalle.cantidad ? parseFloat(detalle.cantidad).toFixed(2) : '0.00';
        const precioPorKg = detalle.precioPorKg ? parseFloat(detalle.precioPorKg).toFixed(2) : '0.00';
        
        detalleDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 2.5fr 1.5fr 1.5fr 1.5fr auto; gap: 15px; align-items: center; padding: 5px 0; width: 100%; box-sizing: border-box;">
                <div>
                    <strong style="color: #1f2937; font-size: 1.125rem; display: block; margin-bottom: 6px;">${nombreMaterial}</strong>
                    <small style="color: #6b7280; font-size: 0.875rem;">Material</small>
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; color: #374151; margin-bottom: 6px; font-weight: 500;">Cantidad (Kg)</label>
                    <input type="number" step="0.01" min="0.01" class="edit-cantidad" value="${cantidad}" 
                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" 
                           onchange="this.closest('.detalle-item').dataset.cantidad = this.value; actualizarSubtotalEdicion(this.closest('.detalle-item'))" />
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; color: #374151; margin-bottom: 6px; font-weight: 500;">Precio/Kg</label>
                    <input type="number" step="0.01" min="0.01" class="edit-precio" value="${precioPorKg}" 
                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" 
                           onchange="this.closest('.detalle-item').dataset.precioPorKg = this.value; actualizarSubtotalEdicion(this.closest('.detalle-item'))" />
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; color: #374151; margin-bottom: 6px; font-weight: 500;">Subtotal</label>
                    <div class="edit-subtotal" style="padding: 12px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; font-weight: 600; color: #2d5a47; text-align: right;">
                        $${(parseFloat(cantidad) * parseFloat(precioPorKg)).toLocaleString('es-CO', {minimumFractionDigits: 2})}
                    </div>
                </div>
                <button type="button" onclick="this.closest('.detalle-item').remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 12px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem; white-space: nowrap; font-weight: 500;">
                    Eliminar
                </button>
            </div>
        `;
        
        // Guardar valores iniciales en dataset
        detalleDiv.dataset.cantidad = cantidad;
        detalleDiv.dataset.precioPorKg = precioPorKg;
        
        detallesContainer.appendChild(detalleDiv);
    }

    // Función para actualizar subtotal cuando se edita cantidad o precio
    window.actualizarSubtotalEdicion = function(detalleDiv) {
        const cantidad = parseFloat(detalleDiv.dataset.cantidad) || 0;
        const precioPorKg = parseFloat(detalleDiv.dataset.precioPorKg) || 0;
        const subtotal = cantidad * precioPorKg;
        const subtotalElement = detalleDiv.querySelector('.edit-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO', {minimumFractionDigits: 2})}`;
        }
    };

    // Función para guardar cambios de edición
    window.guardarEditarCompra = async () => {
        if (!editCompraId) {
            if (typeof showError === 'function') {
                showError('No hay compra seleccionada para editar.');
            }
            return;
        }

        try {
            const editAsociado = document.getElementById('editAsociadoCompra');
            const editBarrio = document.getElementById('editBarrioCompra');
            const editCarreta = document.getElementById('editCarretaCompra');
            const detallesContainer = document.getElementById('editDetallesCompra');

            if (!editAsociado || !editBarrio) {
                if (typeof showError === 'function') {
                    showError('Error: Campos requeridos no encontrados.');
                }
                return;
            }

            const asociadoId = editAsociado.value;
            const barrioId = editBarrio.value;
            const carreta = editCarreta?.value?.trim() || '';

            if (!asociadoId || !barrioId) {
                if (typeof showError === 'function') {
                    showError('Por favor complete todos los campos requeridos.');
                }
                return;
            }

            // Obtener detalles de materiales
            const detalleItems = detallesContainer.querySelectorAll('.detalle-item');
            if (detalleItems.length === 0) {
                if (typeof showError === 'function') {
                    showError('Debe agregar al menos un material.');
                }
                return;
            }

            // Obtener bodega destino (usar la primera disponible o la del primer detalle)
            const apiInstance = window.API || (typeof API !== 'undefined' ? API : null);
            if (!apiInstance || !apiInstance.Bodega) {
                if (typeof showError === 'function') {
                    showError('Error: API no disponible.');
                }
                return;
            }

            const bodegasResponse = await apiInstance.Bodega.getAll();
            let bodegas = [];
            if (Array.isArray(bodegasResponse)) {
                bodegas = bodegasResponse;
            } else if (bodegasResponse && bodegasResponse.success && Array.isArray(bodegasResponse.data)) {
                bodegas = bodegasResponse.data;
            }

            if (!bodegas || bodegas.length === 0) {
                if (typeof showError === 'function') {
                    showError('No hay bodegas disponibles. Por favor, cree una bodega primero.');
                }
                return;
            }

            const bodegaDestino = bodegas[0];

            // Construir detalles
            const detalles = [];
            let totalPagado = 0;

            detalleItems.forEach(item => {
                const materialId = item.dataset.materialId;
                // Obtener valores de los inputs editables
                const cantidadInput = item.querySelector('.edit-cantidad');
                const precioInput = item.querySelector('.edit-precio');
                const cantidad = parseFloat(cantidadInput?.value || item.dataset.cantidad) || 0;
                const precioPorKg = parseFloat(precioInput?.value || item.dataset.precioPorKg) || 0;
                const detalleId = item.dataset.detalleId;

                if (materialId && cantidad > 0 && precioPorKg > 0) {
                    const detalleObj = {
                        material: { idMaterial: parseInt(materialId) },
                        bodegaDestino: { idBodega: bodegaDestino.idBodega },
                        cantidad: cantidad,
                        precioPorKg: precioPorKg
                    };
                    
                    // Si tiene ID de detalle existente, incluirlo para actualización
                    if (detalleId) {
                        detalleObj.idDetalleIngreso = parseInt(detalleId);
                    }
                    
                    detalles.push(detalleObj);
                    totalPagado += cantidad * precioPorKg;
                }
            });

            if (detalles.length === 0) {
                if (typeof showError === 'function') {
                    showError('Debe agregar al menos un material válido.');
                }
                return;
            }

            // Construir objeto de actualización
            const compraActualizada = {
                asociado: { idAsociado: parseInt(asociadoId) },
                barrio: { idBarrio: parseInt(barrioId) },
                carreta: carreta || null,
                totalPagado: totalPagado,
                detalles: detalles
            };

            console.log('💾 Guardando cambios de compra:', compraActualizada);

            const response = await apiInstance.Ingreso.update(editCompraId, compraActualizada);

            if (response && (response.idIngreso || response.success !== false)) {
                if (typeof showSuccess === 'function') {
                    showSuccess('Compra actualizada exitosamente.');
                }
                
                // Cerrar modal
                if (typeof window.closeModal === 'function') {
                    window.closeModal('editarCompraModal');
                }
                
                // Recargar compras
                if (typeof window.cargarCompras === 'function') {
                    await window.cargarCompras();
                }
            } else {
                if (typeof showError === 'function') {
                    showError('Error al actualizar la compra.');
                }
            }
        } catch (error) {
            console.error('❌ Error al guardar cambios:', error);
            if (typeof showError === 'function') {
                showError('Error al guardar los cambios: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    // Agregar listener al botón de guardar edición
    function inicializarBotonGuardarEdicion() {
        const btnGuardar = document.getElementById('btnGuardarEditarCompra');
        if (btnGuardar) {
            // Remover listener anterior
            const nuevoBtn = btnGuardar.cloneNode(true);
            btnGuardar.parentNode.replaceChild(nuevoBtn, btnGuardar);
            
            nuevoBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (nuevoBtn.dataset.procesando === 'true') {
                    return;
                }
                nuevoBtn.dataset.procesando = 'true';
                nuevoBtn.disabled = true;
                
                try {
                    if (typeof window.guardarEditarCompra === 'function') {
                        await window.guardarEditarCompra();
                    }
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    nuevoBtn.dataset.procesando = 'false';
                    nuevoBtn.disabled = false;
                }
            });
            
            console.log('✅ Listener agregado a btnGuardarEditarCompra');
        } else {
            setTimeout(inicializarBotonGuardarEdicion, 500);
        }
    }

    // Inicializar cuando el modal se abre
    const observerEdicion = new MutationObserver(function(mutations) {
        const btn = document.getElementById('btnGuardarEditarCompra');
        if (btn && !btn.dataset.listenerAdded) {
            btn.dataset.listenerAdded = 'true';
            inicializarBotonGuardarEdicion();
        }
    });
    
    observerEdicion.observe(document.body, {
        childList: true,
        subtree: true
    });

    // También intentar inicializar inmediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarBotonGuardarEdicion);
    } else {
        setTimeout(inicializarBotonGuardarEdicion, 500);
    }

    function applyCurrentFiltersAndRender() {
        let filtered = [...compras];

        // Filtro de búsqueda
        const searchTerm = searchInput?.value?.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(c => 
                (`${c.asociado?.nombre || ''} ${c.asociado?.apellido || ''}`.trim() || '').toLowerCase().includes(searchTerm) ||
                (c.asociado?.documento || '').includes(searchTerm) ||
                (c.barrio?.nombre || '').toLowerCase().includes(searchTerm)
            );
        }

        // Filtro de fecha
        const fechaDesde = fechaDesdeInput?.value || '';
        const fechaHasta = fechaHastaInput?.value || '';
        if (fechaDesde || fechaHasta) {
            filtered = filtered.filter(c => {
                if (!c.fecha) return false;
                const fechaCompra = new Date(c.fecha);
                
                if (fechaDesde) {
                    const desde = new Date(fechaDesde.split('/').reverse().join('-'));
                    if (fechaCompra < desde) return false;
                }
                
                if (fechaHasta) {
                    const hasta = new Date(fechaHasta.split('/').reverse().join('-'));
                    hasta.setHours(23, 59, 59, 999);
                    if (fechaCompra > hasta) return false;
                }
                
                return true;
            });
        }

        // Filtro de asociado
        const asociadoId = filtroAsociado?.value || '';
        if (asociadoId) {
            filtered = filtered.filter(c => c.asociado?.idAsociado == asociadoId);
        }

        // Filtro de barrio
        const barrioId = filtroBarrio?.value || '';
        if (barrioId) {
            filtered = filtered.filter(c => c.barrio?.idBarrio == barrioId);
        }

        renderTable(filtered);
    }

    // Inicializar eventos
    function inicializarEventos() {
        console.log('🔧 Inicializando eventos de compras...');
        
        // Botón nueva compra - buscar nuevamente por si no estaba disponible antes
        btnNuevaCompra = document.getElementById("btnNuevaCompra");
        
        if (btnNuevaCompra) {
            console.log('✅ Botón btnNuevaCompra encontrado, agregando event listener');
            
            // Remover listener anterior si existe (clonar el botón)
            const nuevoBtn = btnNuevaCompra.cloneNode(true);
            btnNuevaCompra.parentNode.replaceChild(nuevoBtn, btnNuevaCompra);
            btnNuevaCompra = nuevoBtn;
            
            btnNuevaCompra.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Click en botón Nueva Compra');
                
                editCompraId = null;
                
                // Asegurar que el modal esté cargado
                let modal = document.getElementById('nuevaCompraModal');
                if (!modal && window.cargarModalCompra) {
                    console.log('📦 Cargando modal nuevaCompraModal...');
                    await window.cargarModalCompra('nuevaCompraModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaCompraModal');
                }
                
                if (!modal) {
                    console.error('❌ No se pudo cargar el modal nuevaCompraModal');
                    if (typeof showError === 'function') {
                        showError('No se pudo cargar el formulario. Por favor, recargue la página.');
                    } else {
                        alert('No se pudo cargar el formulario. Por favor, recargue la página.');
                    }
                    return;
                }
                
                // Limpiar formulario usando funciones globales
                if (window.clearItemsCompra) window.clearItemsCompra();
                
                const searchAsociado = document.getElementById('searchAsociadoCompra');
                const searchMaterial = document.getElementById('searchMaterialCompra');
                const carretaInput = document.getElementById('carretaNuevaCompra');
                const barrioSelect = document.getElementById('barrioNuevaCompra');
                if (searchAsociado) searchAsociado.value = '';
                if (searchMaterial) searchMaterial.value = '';
                if (carretaInput) carretaInput.value = '';
                if (barrioSelect) barrioSelect.value = '';
                
                // Cargar selectores
                await cargarSelectoresNuevaCompra();
                
                // Inicializar modal de compra si existe modales-compra-venta.js (necesario para búsquedas)
                if (typeof window.inicializarModalesCompraVenta === 'function') {
                    window.inicializarModalesCompraVenta();
                } else if (typeof inicializarModalCompra === 'function') {
                    setTimeout(async () => {
                        await inicializarModalCompra();
                    }, 500);
                }
                
                console.log('🔓 Abriendo modal nuevaCompraModal');
                if (typeof window.openModal === 'function') {
                    window.openModal('nuevaCompraModal');
                } else {
                    modal.style.display = 'flex';
                    modal.classList.add('active');
                }
                
                // Agregar listener al botón después de abrir el modal
                setTimeout(() => {
                    const btnFinalizar = document.getElementById('btnFinalizarCompra');
                    if (btnFinalizar && !btnFinalizar.dataset.listenerAdded) {
                        btnFinalizar.dataset.listenerAdded = 'true';
                        btnFinalizar.addEventListener('click', async function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            
                            console.log('🔘 CLICK EN BOTÓN FINALIZAR COMPRA - DESDE app-compras.js');
                            
                            if (this.dataset.procesando === 'true') {
                                console.log('⚠️ Ya procesando...');
                                return;
                            }
                            this.dataset.procesando = 'true';
                            this.disabled = true;
                            
                            try {
                                if (typeof window.guardarNuevaCompra === 'function') {
                                    await window.guardarNuevaCompra();
                                } else {
                                    console.error('❌ window.guardarNuevaCompra no disponible');
                                }
                            } catch (error) {
                                console.error('❌ Error:', error);
                            } finally {
                                this.dataset.procesando = 'false';
                                this.disabled = false;
                            }
                        }, true); // Usar capture phase
                        console.log('✅ Listener agregado desde app-compras.js');
                    }
                }, 200);
            });
        } else {
            console.error('❌ Botón btnNuevaCompra NO encontrado');
        }
        
        // Event listener delegado como respaldo (captura clicks incluso si el botón no se encontró inicialmente)
        document.addEventListener('click', async (e) => {
            // Verificar si el click fue en el botón o dentro de él
            if (e.target.closest && (e.target.closest('#btnNuevaCompra') || e.target.id === 'btnNuevaCompra')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Si ya hay un listener activo, no hacer nada (evitar doble ejecución)
                if (e.target.dataset.procesado) return;
                e.target.dataset.procesado = 'true';
                setTimeout(() => delete e.target.dataset.procesado, 1000);
                
                console.log('🖱️ Click en botón Nueva Compra (delegado)');
                
                editCompraId = null;
                
                let modal = document.getElementById('nuevaCompraModal');
                if (!modal && window.cargarModalCompra) {
                    await window.cargarModalCompra('nuevaCompraModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaCompraModal');
                }
                
                if (modal && typeof window.openModal === 'function') {
                    window.openModal('nuevaCompraModal');
                } else if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('active');
                }
            }
        });

        // Botón finalizar compra - usar delegación de eventos (funciona incluso si el botón se carga después)
        // Usar capture phase para capturar antes que otros listeners
        document.addEventListener('click', async function(e) {
            // Verificar si el click fue en el botón Finalizar Compra
            const btnFinalizar = e.target.closest && e.target.closest('#btnFinalizarCompra');
            const btnGuardar = e.target.closest && e.target.closest('#btnGuardarNuevaCompra');
            const esClickDirecto = e.target.id === 'btnFinalizarCompra' || e.target.id === 'btnGuardarNuevaCompra';
            
            if (btnFinalizar || btnGuardar || esClickDirecto) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🔘 CLICK DETECTADO en botón Finalizar/Guardar compra', {
                    btnFinalizar: !!btnFinalizar,
                    btnGuardar: !!btnGuardar,
                    esClickDirecto,
                    targetId: e.target.id,
                    targetTag: e.target.tagName,
                    targetClass: e.target.className
                });
                
                // Prevenir doble ejecución
                const elemento = btnFinalizar || btnGuardar || e.target;
                if (elemento && elemento.dataset.procesando === 'true') {
                    console.log('⚠️ Ya se está procesando...');
                    return;
                }
                if (elemento) {
                    elemento.dataset.procesando = 'true';
                    if (elemento.disabled !== undefined) elemento.disabled = true;
                }
                
                try {
                    console.log('▶️ Ejecutando guardarNuevaCompra...');
                    if (typeof window.guardarNuevaCompra === 'function') {
                        await window.guardarNuevaCompra();
                    } else {
                        console.error('❌ window.guardarNuevaCompra no disponible');
                    }
                } catch (error) {
                    console.error('❌ Error al guardar compra:', error);
                    if (typeof showError === 'function') {
                        showError('Error al guardar la compra: ' + (error.message || 'Error desconocido'));
                    } else {
                        alert('Error al guardar la compra: ' + (error.message || 'Error desconocido'));
                    }
                } finally {
                    if (elemento) {
                        elemento.dataset.procesando = 'false';
                        if (elemento.disabled !== undefined) elemento.disabled = false;
                    }
                }
                
                return false;
            }
        }, true); // Usar capture phase para capturar el evento antes que otros listeners

        // Filtros
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
                if (filtroAsociado) filtroAsociado.value = '';
                if (filtroBarrio) filtroBarrio.value = '';
                applyCurrentFiltersAndRender();
            });
        });
    }

    // Inicializar
    inicializarReferencias();
    
    // Esperar a que el DOM esté completamente listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await cargarSelectoresFiltros();
            await cargarCompras();
            inicializarEventos();
        });
    } else {
        // El DOM ya está listo, pero esperar un momento para asegurar que todos los scripts se hayan cargado
        setTimeout(async () => {
            await cargarSelectoresFiltros();
            await cargarCompras();
            inicializarEventos();
        }, 100);
    }
}

// Ejecutar cuando el DOM esté listo
// Esperar un poco más para asegurar que todos los scripts se hayan cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            inicializarCompras();
        }, 300);
    });
} else {
    setTimeout(() => {
        inicializarCompras();
    }, 300);
}

