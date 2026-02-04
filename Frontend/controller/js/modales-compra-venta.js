/**
 * ============================================
 * GESTIÓN DE MODALES DE COMPRA Y VENTA
 * Maneja la funcionalidad completa de los modales de compra y venta
 * ============================================
 */

let modalCompraInicializado = false;
let modalVentaInicializado = false;
let asociadosList = [];
let materialesList = [];
let barriosList = [];
let bodegasList = [];
let clientesList = [];
let itemsCompra = [];
let itemsVenta = [];
let asociadoSeleccionadoCompra = null;
let clienteSeleccionadoVenta = null;

/**
 * Crear dropdown de búsqueda
 */
function crearDropdownBusqueda(inputId, items, onSelect, displayKey = 'nombre', getItemsFn = null) {
    const input = document.getElementById(inputId);
    if (!input) return null;

    // Crear contenedor del dropdown
    let dropdownContainer = input.parentElement.querySelector('.dropdown-container');
    if (!dropdownContainer) {
        dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-container';
        dropdownContainer.style.cssText = 'position: relative; width: 100%;';
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(dropdownContainer);
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'material-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    input.addEventListener('input', (e) => {
        const term = (e.target.value || '').toLowerCase().trim();
        
        if (term.length < 1) {
            dropdown.style.display = 'none';
            return;
        }

        // Si hay una función para obtener items dinámicamente, usarla
        let itemsActuales = items;
        if (getItemsFn && typeof getItemsFn === 'function') {
            try {
                itemsActuales = getItemsFn();
                console.log('🔍 Items obtenidos dinámicamente:', itemsActuales.length);
            } catch (error) {
                console.error('❌ Error al obtener items dinámicamente:', error);
                itemsActuales = items;
            }
        }
        
        const filtrados = itemsActuales.filter(item => {
            if (typeof item !== 'object') {
                return String(item).toLowerCase().includes(term);
            }
            
            // Buscar en múltiples campos posibles
            const camposABuscar = [
                item[displayKey],
                item.nombreMaterial,
                item.nombre,
                item.descripcion,
                `${item.nombre || ''} ${item.apellido || ''}`.trim(),
                item.documento
            ].filter(campo => campo); // Filtrar campos vacíos
            
            return camposABuscar.some(campo => 
                campo.toString().toLowerCase().includes(term)
            );
        });

        if (filtrados.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = filtrados.slice(0, 10).map(item => {
            let texto = '';
            if (typeof item === 'object') {
                // Priorizar nombreMaterial, luego nombre, luego descripcion
                texto = item.nombreMaterial || item.nombre || item.descripcion || item[displayKey] || 
                       `${item.nombre || ''} ${item.apellido || ''}`.trim() || 
                       item.documento || item.nombreEmpresa || 'Material';
            } else {
                texto = String(item);
            }
            // Escapar comillas para evitar problemas en JSON
            try {
                return `<div class="dropdown-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>${texto}</div>`;
            } catch (e) {
                console.error('Error al serializar item:', item, e);
                return '';
            }
        }).filter(html => html).join('');

        dropdown.style.display = 'block';

        // Agregar listeners a los items
        dropdown.querySelectorAll('.dropdown-item').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                const item = JSON.parse(itemEl.getAttribute('data-item'));
                input.value = typeof item === 'object'
                    ? (item[displayKey] || item.nombreMaterial || `${item.nombre || ''} ${item.apellido || ''}`.trim() || item.documento || item.nombreEmpresa || '')
                    : String(item);
                dropdown.style.display = 'none';
                if (onSelect) onSelect(item);
            });

            itemEl.addEventListener('mouseenter', () => {
                itemEl.style.backgroundColor = '#f0f0f0';
            });
            itemEl.addEventListener('mouseleave', () => {
                itemEl.style.backgroundColor = 'white';
            });
        });
    });

    // Ocultar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    dropdownContainer.innerHTML = '';
    dropdownContainer.appendChild(dropdown);
    return dropdown;
}

/**
 * Inicializar modal de compra
 */
async function inicializarModalCompra() {
    // Buscar cualquier modal de compra (compraModal o nuevaCompraModal) o la sección en la página
    const modal = document.getElementById('compraModal') || document.getElementById('nuevaCompraModal');
    const section = document.getElementById('nuevaCompraSection');
    
    // Si no hay modal ni sección, reintentar
    if (!modal && !section) {
        setTimeout(inicializarModalCompra, 500);
        return;
    }
    
    modalCompraInicializado = true;
    
    // Cargar datos
    try {
        const [asociadosRes, materialesRes, barriosRes, bodegasRes] = await Promise.all([
            window.API.Asociado.getAll().catch((err) => {
                console.warn('⚠️ Error al cargar asociados:', err);
                return { success: false, data: [] };
            }),
            window.API.Material.getAll().catch((err) => {
                console.warn('⚠️ Error al cargar materiales desde API, usando localStorage:', err);
                // Si falla la API, intentar usar localStorage directamente
                try {
                    const inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
                    const materialesDesdeInventario = inventario
                        .filter(item => item.nombreMaterial || item.descripcion) // Solo items con nombre
                        .map(item => ({
                            idMaterial: item.idMaterial || null,
                            nombre: item.nombreMaterial || item.descripcion,
                            categoria: item.categoria ? { nombre: item.categoria } : null
                        }));
                    console.log('✅ Materiales cargados desde localStorage:', materialesDesdeInventario.length);
                    return { success: true, data: materialesDesdeInventario };
                } catch (localStorageError) {
                    console.error('❌ Error al cargar desde localStorage:', localStorageError);
                    return { success: false, data: [] };
                }
            }),
            window.API.Barrio.getAll().catch((err) => {
                console.warn('⚠️ Error al cargar barrios:', err);
                return { success: false, data: [] };
            }),
            window.API.Bodega.getAll().catch((err) => {
                console.warn('⚠️ Error al cargar bodegas:', err);
                return { success: false, data: [] };
            })
        ]);
        
        asociadosList = asociadosRes.success ? asociadosRes.data : (Array.isArray(asociadosRes) ? asociadosRes : []);
        materialesList = materialesRes.success ? materialesRes.data : (Array.isArray(materialesRes) ? materialesRes : []);
        barriosList = barriosRes.success ? barriosRes.data : (Array.isArray(barriosRes) ? barriosRes : []);
        bodegasList = bodegasRes.success ? bodegasRes.data : (Array.isArray(bodegasRes) ? bodegasRes : []);
        
        console.log('✅ Datos cargados para modal de compra:', {
            asociados: asociadosList.length,
            materiales: materialesList.length,
            barrios: barriosList.length,
            bodegas: bodegasList.length
        });
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
    }
    
    // Configurar tabs de asociado
    const btnAsociadoInscrito = document.getElementById('btnAsociadoInscrito');
    const btnUsuarioSinRegistrar = document.getElementById('btnUsuarioSinRegistrar');
    const panelAsociadoInscrito = document.getElementById('panelAsociadoInscrito');
    const panelUsuarioSinRegistrar = document.getElementById('panelUsuarioSinRegistrar');
    
    if (btnAsociadoInscrito && btnUsuarioSinRegistrar) {
        btnAsociadoInscrito.addEventListener('click', () => {
            btnAsociadoInscrito.classList.add('active');
            btnAsociadoInscrito.style.background = '#2d5a47';
            btnAsociadoInscrito.style.color = 'white';
            btnUsuarioSinRegistrar.classList.remove('active');
            btnUsuarioSinRegistrar.style.background = '#e5e7eb';
            btnUsuarioSinRegistrar.style.color = '#374151';
            if (panelAsociadoInscrito) panelAsociadoInscrito.style.display = 'block';
            if (panelUsuarioSinRegistrar) panelUsuarioSinRegistrar.style.display = 'none';
            asociadoSeleccionadoCompra = null;
            if (document.getElementById('searchAsociadoCompra')) {
                document.getElementById('searchAsociadoCompra').value = '';
            }
            // Ocultar información adicional si no hay asociado seleccionado
            const infoAdicionalSection = document.getElementById('informacionAdicionalSection');
            if (infoAdicionalSection) infoAdicionalSection.style.display = 'none';
        });
        
        btnUsuarioSinRegistrar.addEventListener('click', () => {
            btnUsuarioSinRegistrar.classList.add('active');
            btnUsuarioSinRegistrar.style.background = '#2d5a47';
            btnUsuarioSinRegistrar.style.color = 'white';
            btnAsociadoInscrito.classList.remove('active');
            btnAsociadoInscrito.style.background = '#e5e7eb';
            btnAsociadoInscrito.style.color = '#374151';
            if (panelAsociadoInscrito) panelAsociadoInscrito.style.display = 'none';
            if (panelUsuarioSinRegistrar) panelUsuarioSinRegistrar.style.display = 'block';
            asociadoSeleccionadoCompra = null;
            // Limpiar campos del usuario sin registrar
            if (document.getElementById('usuarioSinRegistrarNombre')) document.getElementById('usuarioSinRegistrarNombre').value = '';
            if (document.getElementById('usuarioSinRegistrarApellido')) document.getElementById('usuarioSinRegistrarApellido').value = '';
            if (document.getElementById('usuarioSinRegistrarDocumento')) document.getElementById('usuarioSinRegistrarDocumento').value = '';
            if (document.getElementById('usuarioSinRegistrarTelefono')) document.getElementById('usuarioSinRegistrarTelefono').value = '';
        });
    }
    
    // Función para limpiar formulario cuando se muestra
    function limpiarFormularioCompra() {
        itemsCompra = [];
        asociadoSeleccionadoCompra = null;
        actualizarListaItemsCompra();
        actualizarTotalCompra();
        
        // Limpiar inputs
        const searchAsociado = document.getElementById('searchAsociadoCompra');
        const searchMaterial = document.getElementById('searchMaterialCompra');
        const inputCarreta = document.getElementById('carretaNuevaCompra') || document.getElementById('carretaCompra');
        const barrioSelect = document.getElementById('barrioNuevaCompra') || document.getElementById('selectBarrioCompra');
        const asociadoInfo = document.getElementById('asociadoSeleccionadoInfo');
        
        if (searchAsociado) searchAsociado.value = '';
        if (searchMaterial) searchMaterial.value = '';
        if (inputCarreta) inputCarreta.value = '';
        if (barrioSelect) barrioSelect.value = '';
        if (asociadoInfo) asociadoInfo.style.display = 'none';
        
        // Reset tabs
        if (btnAsociadoInscrito && panelAsociadoInscrito) {
            btnAsociadoInscrito.click();
        }
    }
    
    // Limpiar items cuando se abre el modal (si existe)
    if (modal) {
        const observer = new MutationObserver((mutations) => {
            if (modal.classList.contains('active') || modal.style.display === 'flex' || modal.style.display === 'block') {
                limpiarFormularioCompra();
            }
        });
        
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        
        // También observar cambios en style.display del modal
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'style' && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                    limpiarFormularioCompra();
                }
            });
        });
        styleObserver.observe(modal, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Limpiar items cuando se muestra la sección en la página
    if (section) {
        const sectionObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'style' && section.style.display === 'block') {
                    limpiarFormularioCompra();
                }
            });
        });
        sectionObserver.observe(section, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Exportar función para limpiar desde fuera
    window.limpiarFormularioCompra = limpiarFormularioCompra;

    // Configurar búsqueda de asociados (solo una vez para evitar listeners duplicados)
    const searchAsociadoCompra = document.getElementById('searchAsociadoCompra');
    if (searchAsociadoCompra && !searchAsociadoCompra.dataset.listenerAdded) {
        searchAsociadoCompra.dataset.listenerAdded = 'true';
        crearDropdownBusqueda('searchAsociadoCompra', asociadosList, (asociado) => {
            asociadoSeleccionadoCompra = asociado;
            console.log('✅ Asociado seleccionado:', asociado);
            
            // Mostrar información del asociado seleccionado (incluyendo carreta y ruta)
            const infoDiv = document.getElementById('asociadoSeleccionadoInfo');
            const infoText = document.getElementById('asociadoInfoText');
            const carretaText = document.getElementById('asociadoCarretaText');
            const rutaText = document.getElementById('asociadoRutaText');
            
            if (infoDiv && infoText) {
                infoText.innerHTML = `
                    <div><strong>Nombre:</strong> ${asociado.nombre} ${asociado.apellido || ''}</div>
                    <div><strong>Documento:</strong> ${asociado.documento || '-'}</div>
                    <div><strong>Teléfono:</strong> ${asociado.telefono || '-'}</div>
                    <div><strong>Tipo:</strong> ${asociado.tipo || '-'}</div>
                `;
                
                // Mostrar carreta y ruta en la sección de información
                if (carretaText) {
                    carretaText.innerHTML = `<strong>Carreta:</strong> ${asociado.carreta || 'No asignada'}`;
                }
                if (rutaText) {
                    const rutaNombre = asociado.barrio?.nombre || asociado.ruta || 'No asignada';
                    rutaText.innerHTML = `<strong>Ruta:</strong> ${rutaNombre}`;
                }
                
                // Si el asociado tiene un barrio, guardar su ID en un campo oculto o en el objeto asociado
                if (asociado.barrio && asociado.barrio.idBarrio) {
                    asociado.barrioId = asociado.barrio.idBarrio;
                    // También intentar actualizar el select de barrio si existe
                    const barrioSelect = document.getElementById('barrioNuevaCompra');
                    if (barrioSelect) {
                        barrioSelect.value = asociado.barrio.idBarrio;
                    }
                }
                
                infoDiv.style.display = 'block';
            }
        }, null); // null para usar la lógica por defecto que concatena nombre y apellido
    }
    
    // Configurar búsqueda de materiales desde inventario
    const searchMaterialCompra = document.getElementById('searchMaterialCompra');
    if (searchMaterialCompra) {
        // Función para cargar materiales disponibles del inventario
        function cargarMaterialesDisponibles() {
            console.log('🔄 Cargando materiales disponibles del inventario...');
            const inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
            console.log('📦 Inventario desde localStorage:', inventario);
            console.log('📋 Materiales desde API:', materialesList);
            
            const materialesDisponibles = [];
            const idsAgregados = new Set();
            
            // Primero, agregar TODOS los materiales del inventario (localStorage) que tengan nombre
            inventario.forEach(itemInventario => {
                const nombreMaterial = itemInventario.nombreMaterial || itemInventario.descripcion;
                
                // Incluir cualquier item del inventario que tenga nombre (no importa si tiene precio o idMaterial)
                if (nombreMaterial) {
                    const idMaterial = itemInventario.idMaterial;
                    const precioUnidad = parseFloat(itemInventario.precioUnidad) || 0;
                    
                    // Buscar el material correspondiente en la API si tiene idMaterial
                    let materialAPI = null;
                    if (idMaterial) {
                        materialAPI = materialesList.find(m => m.idMaterial === idMaterial);
                    } else {
                        // Buscar por nombreMaterial en la API
                        materialAPI = materialesList.find(m => {
                            const nombreAPI = m.nombreMaterial?.nombre || m.nombre;
                            return nombreAPI && nombreAPI.toLowerCase() === nombreMaterial.toLowerCase();
                        });
                    }
                    
                    // Crear objeto material con la información disponible
                    const materialObj = {
                        idMaterial: materialAPI?.idMaterial || idMaterial || null,
                        nombreMaterial: nombreMaterial,
                        nombre: nombreMaterial,
                        precioUnidad: precioUnidad,
                        categoria: itemInventario.categoria || materialAPI?.categoria?.nombre || null,
                        codigo: itemInventario.codigo || null,
                        ...(materialAPI || {})
                    };
                    
                    // Evitar duplicados por idMaterial o por nombre
                    const keyParaDuplicados = materialObj.idMaterial || nombreMaterial.toLowerCase();
                    if (!idsAgregados.has(keyParaDuplicados)) {
                        materialesDisponibles.push(materialObj);
                        if (materialObj.idMaterial) {
                            idsAgregados.add(materialObj.idMaterial);
                        } else {
                            idsAgregados.add(nombreMaterial.toLowerCase());
                        }
                        console.log('✅ Material agregado desde inventario:', nombreMaterial, 'Precio:', precioUnidad);
                    }
                }
            });
            
            // También agregar materiales de la API que no estén ya en la lista
            materialesList.forEach(material => {
                const nombreAPI = material.nombreMaterial?.nombre || material.nombre;
                if (!nombreAPI) return;
                
                // Verificar si ya está agregado por id o por nombre
                const yaAgregadoPorId = material.idMaterial && idsAgregados.has(material.idMaterial);
                const yaAgregadoPorNombre = !material.idMaterial && idsAgregados.has(nombreAPI.toLowerCase());
                
                if (!yaAgregadoPorId && !yaAgregadoPorNombre) {
                    // Buscar si hay información de precio en inventario por nombre
                    const itemInventarioPorNombre = inventario.find(item => {
                        const nombreItem = (item.nombreMaterial || item.descripcion || '').toLowerCase();
                        return nombreItem === nombreAPI.toLowerCase();
                    });
                    
                    const precioUnidadInventario = itemInventarioPorNombre ? 
                        parseFloat(itemInventarioPorNombre.precioUnidad) || 0 : 0;
                    
                    materialesDisponibles.push({
                        ...material,
                        nombreMaterial: nombreAPI,
                        nombre: nombreAPI,
                        precioUnidad: precioUnidadInventario
                    });
                    
                    if (material.idMaterial) {
                        idsAgregados.add(material.idMaterial);
                    } else {
                        idsAgregados.add(nombreAPI.toLowerCase());
                    }
                    console.log('✅ Material agregado desde API:', nombreAPI, 'Precio:', precioUnidadInventario);
                }
            });
            
            console.log('✅ Materiales disponibles cargados:', materialesDisponibles.length, materialesDisponibles);
            return materialesDisponibles;
        }
        
        // Función para obtener materiales cuando se busca (se llama dinámicamente)
        const obtenerMaterialesParaBusqueda = () => {
            const materiales = cargarMaterialesDisponibles();
            console.log('🔍 Materiales para búsqueda obtenidos:', materiales.length, materiales);
            return materiales;
        };
        
        // Primero cargar los materiales disponibles
        const materialesIniciales = cargarMaterialesDisponibles();
        console.log('📦 Materiales iniciales cargados:', materialesIniciales.length);
        
        // Inicializar con los materiales del inventario, pero usar función dinámica para actualizar
        crearDropdownBusqueda('searchMaterialCompra', materialesIniciales, (material) => {
            // Obtener precio del inventario
            let precioPorKg = material.precioUnidad || 0;
            
            // Si no hay precio en inventario, pedirlo
            if (precioPorKg <= 0) {
                const precioInput = prompt(`Ingrese el precio por kg para ${material.nombreMaterial || material.nombre || 'este material'}:`, '0');
                precioPorKg = parseFloat(precioInput) || 0;
                
                if (precioPorKg <= 0) {
                    showWarning('Debe ingresar un precio válido');
                    return;
                }
            }

            // Verificar si el material ya está agregado
            const existe = itemsCompra.find(item => item.material.idMaterial === material.idMaterial);
            if (existe) {
                showInfo('Este material ya está agregado. Puede modificar la cantidad.');
                return;
            }

            // Agregar material a la lista
            itemsCompra.push({
                material: material,
                cantidad: 0,
                precioPorKg: precioPorKg,
                precioTotal: 0
            });

            actualizarListaItemsCompra();
            searchMaterialCompra.value = '';
        }, 'nombreMaterial', obtenerMaterialesParaBusqueda);

        // Permitir agregar material al presionar Enter
        searchMaterialCompra.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.toLowerCase().trim();
                const material = materialesList.find(m => {
                    const nombre = m.nombreMaterial?.nombre || m.nombre || '';
                    return nombre.toLowerCase().includes(term);
                });
                if (material) {
                    // Buscar precio en inventario
                    let precioPorKg = 0;
                    const inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
                    const itemInventario = inventario.find(item => 
                        item.idMaterial === material.idMaterial || 
                        item.nombreMaterial === (material.nombreMaterial?.nombre || material.nombre)
                    );
                    
                    if (itemInventario && itemInventario.precioUnidad) {
                        precioPorKg = parseFloat(itemInventario.precioUnidad) || 0;
                    }
                    
                    // Si no hay precio, pedirlo
                    if (precioPorKg <= 0) {
                        const precioInput = prompt(`Ingrese el precio por kg para ${material.nombreMaterial?.nombre || material.nombre}:`, '0');
                        precioPorKg = parseFloat(precioInput) || 0;
                    }
                    
                    if (precioPorKg > 0) {
                        const existe = itemsCompra.find(item => item.material.idMaterial === material.idMaterial);
                        if (!existe) {
                            itemsCompra.push({
                                material: material,
                                cantidad: 0,
                                precioPorKg: precioPorKg,
                                precioTotal: 0
                            });
                            actualizarListaItemsCompra();
                            e.target.value = '';
                        }
                    }
                }
            }
        });
    }
}

/**
 * Inicializar modal de venta
 */
async function inicializarModalVenta() {
    if (modalVentaInicializado) return;
    
    // Buscar cualquier modal de venta (ventaModal o nuevaVentaModal)
    const modal = document.getElementById('ventaModal') || document.getElementById('nuevaVentaModal');
    if (!modal) {
        setTimeout(inicializarModalVenta, 500);
        return;
    }
    
    modalVentaInicializado = true;
    
    // Cargar datos
    try {
        const [materialesRes, bodegasRes, clientesRes] = await Promise.all([
            window.API.Material.getAll().catch(() => ({ success: false, data: [] })),
            window.API.Bodega.getAll().catch(() => ({ success: false, data: [] })),
            window.API.Cliente.getAll().catch(() => ({ success: false, data: [] }))
        ]);
        
        materialesList = materialesRes.success ? materialesRes.data : [];
        bodegasList = bodegasRes.success ? bodegasRes.data : [];
        clientesList = clientesRes.success ? clientesRes.data : [];
        
        console.log('✅ Datos cargados para modal de venta:', {
            materiales: materialesList.length,
            bodegas: bodegasList.length,
            clientes: clientesList.length
        });
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
    }
    
    // Limpiar items cuando se abre el modal
    const observer = new MutationObserver((mutations) => {
        if (modal.classList.contains('active') || modal.style.display === 'flex' || modal.style.display === 'block') {
            itemsVenta = [];
            clienteSeleccionadoVenta = null;
            if (typeof actualizarListaItemsVenta === 'function') {
                actualizarListaItemsVenta();
            }
            
            // Limpiar inputs
            const searchCliente = document.getElementById('searchClienteVenta') || document.getElementById('searchAsociadoVenta');
            const searchMaterial = document.getElementById('searchMaterialVenta');
            const bodegaSelect = document.getElementById('bodegaNuevaVenta') || document.getElementById('selectBodegaOrigenVenta');
            
            if (searchCliente) searchCliente.value = '';
            if (searchMaterial) searchMaterial.value = '';
            if (bodegaSelect) bodegaSelect.value = '';
        }
    });
    
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

    // Configurar búsqueda de clientes
    const searchClienteVenta = document.getElementById('searchClienteVenta') || document.getElementById('searchAsociadoVenta');
    if (searchClienteVenta) {
        crearDropdownBusqueda(searchClienteVenta.id, clientesList, (cliente) => {
            clienteSeleccionadoVenta = cliente;
            console.log('Cliente seleccionado:', cliente);
        }, 'nombreEmpresa');
    }

    // Configurar búsqueda de materiales
    const searchMaterialVenta = document.getElementById('searchMaterialVenta');
    if (searchMaterialVenta) {
        crearDropdownBusqueda('searchMaterialVenta', materialesList, (material) => {
            // Pedir precio por kg
            const precioInput = prompt(`Ingrese el precio por kg de venta para ${material.nombre}:`, '0');
            const precioPorKg = parseFloat(precioInput) || 0;
            
            if (precioPorKg <= 0) {
                showWarning('Debe ingresar un precio válido');
                return;
            }

            // Verificar si el material ya está agregado
            const existe = itemsVenta.find(item => item.material.idMaterial === material.idMaterial);
            if (existe) {
                showInfo('Este material ya está agregado. Puede modificar la cantidad.');
                return;
            }

            // Agregar material a la lista
            itemsVenta.push({
                material: material,
                cantidad: 0,
                precioPorKg: precioPorKg,
                precioTotal: 0
            });

            actualizarListaItemsVenta();
            searchMaterialVenta.value = '';
        }, 'nombre');

        // Permitir agregar material al presionar Enter
        searchMaterialVenta.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.toLowerCase().trim();
                const material = materialesList.find(m => 
                    m.nombre.toLowerCase().includes(term)
                );
                if (material) {
                    const precioInput = prompt(`Ingrese el precio por kg de venta para ${material.nombre}:`, '0');
                    const precioPorKg = parseFloat(precioInput) || 0;
                    if (precioPorKg > 0) {
                        const existe = itemsVenta.find(item => item.material.idMaterial === material.idMaterial);
                        if (!existe) {
                            itemsVenta.push({
                                material: material,
                                cantidad: 0,
                                precioPorKg: precioPorKg,
                                precioTotal: 0
                            });
                            actualizarListaItemsVenta();
                            e.target.value = '';
                        }
                    }
                }
            }
        });
    }
}

/**
 * Actualizar lista de items en modal de compra
 */
function actualizarListaItemsCompra() {
    // Buscar en cualquier modal de compra (compraModal o nuevaCompraModal) o en la sección de la página
    const container = document.querySelector('#compraModal .added-items, #nuevaCompraModal .added-items, #nuevaCompraSection .added-items');
    if (!container) {
        console.warn('⚠️ No se encontró contenedor .added-items para actualizar lista de items');
        return;
    }
    
    container.innerHTML = '';
    
    if (itemsCompra.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay materiales agregados</p>';
        return;
    }
    
    itemsCompra.forEach((item, index) => {
        const materialNombre = item.material.nombreMaterial?.nombre || item.material.nombre || 'Material';
        const itemDiv = document.createElement('div');
        itemDiv.className = 'added-item';
        itemDiv.setAttribute('data-price-per-kg', item.precioPorKg);
        itemDiv.innerHTML = `
            <div class="added-item-info">
                <div class="added-item-name">${materialNombre}</div>
                <div class="added-item-code">ID - ${item.material.idMaterial}</div>
                <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
                    Precio: $${item.precioPorKg.toLocaleString('es-ES', {minimumFractionDigits: 2})} / kg
                </div>
            </div>
            <div class="quantity-input">
                <span style="font-size: 0.875rem; color: #6b7280">Cantidad (Kg)</span>
                <input type="number" value="${item.cantidad}" step="0.01" min="0" 
                       class="quantity-field" data-index="${index}" 
                       placeholder="0.00" />
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span class="added-item-price">$${item.precioTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
                <button class="remove-item" data-index="${index}" title="Eliminar" style="margin-top: 8px; background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
    
    // Agregar listeners
    container.querySelectorAll('.quantity-field').forEach(input => {
        // Remover listeners anteriores para evitar duplicados
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        newInput.addEventListener('input', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            const cantidad = parseFloat(e.target.value) || 0;
            
            // Actualizar el item en el array
            if (itemsCompra[index]) {
                itemsCompra[index].cantidad = cantidad;
                itemsCompra[index].precioTotal = cantidad * itemsCompra[index].precioPorKg;
                
                // Actualizar solo el precio del item actual sin regenerar toda la lista
                const itemDiv = e.target.closest('.added-item');
                if (itemDiv) {
                    const priceElement = itemDiv.querySelector('.added-item-price');
                    if (priceElement) {
                        priceElement.textContent = `$${itemsCompra[index].precioTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
                    }
                }
                
                // Actualizar el total de la compra
                actualizarTotalCompra();
            }
        });
        
        newInput.addEventListener('blur', (e) => {
            // Cuando se pierde el foco, asegurar que el valor esté correcto
            const index = parseInt(e.target.getAttribute('data-index'));
            if (itemsCompra[index]) {
                const cantidad = parseFloat(e.target.value) || 0;
                e.target.value = cantidad;
            }
        });
    });
    
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.remove-item').getAttribute('data-index'));
            itemsCompra.splice(index, 1);
            actualizarListaItemsCompra();
            actualizarTotalCompra();
        });
    });
}

/**
 * Actualizar total de compra en el modal
 */
function actualizarTotalCompra() {
    // Calcular el total sumando todos los precioTotal de los items
    const total = itemsCompra.reduce((sum, item) => {
        const precioTotal = parseFloat(item.precioTotal) || 0;
        return sum + precioTotal;
    }, 0);
    
    console.log('💰 Total calculado:', total, 'Items:', itemsCompra.length, itemsCompra.map(i => ({ cantidad: i.cantidad, precioPorKg: i.precioPorKg, precioTotal: i.precioTotal })));
    
    // Actualizar el total en el footer del modal
    const totalElement = document.getElementById('totalCompraModal');
    if (totalElement) {
        totalElement.textContent = `$${total.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    }
    
    // También actualizar en el contenedor de items si existe (buscar en modal o en la sección de la página)
    const container = document.querySelector('#compraModal .added-items, #nuevaCompraModal .added-items, #nuevaCompraSection .added-items');
    if (container) {
        let totalDiv = container.querySelector('.total-compra');
        if (!totalDiv && itemsCompra.length > 0) {
            totalDiv = document.createElement('div');
            totalDiv.className = 'total-compra';
            container.appendChild(totalDiv);
        }
        if (totalDiv) {
            totalDiv.style.cssText = 'margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 1.1rem;';
            totalDiv.innerHTML = `
                <span>Subtotal:</span>
                <span style="color: #2d5a47;">$${total.toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
            `;
        }
    }
}

// Exportar función para obtener asociado nuevo si fue creado
window.getNuevoAsociadoCompra = () => {
    const panelNuevo = document.getElementById('panelAsociadoNuevo');
    if (!panelNuevo || panelNuevo.style.display === 'none') return null;
    
    const nombre = document.getElementById('nuevoAsociadoNombre')?.value?.trim() || '';
    const apellido = document.getElementById('nuevoAsociadoApellido')?.value?.trim() || '';
    const documento = document.getElementById('nuevoAsociadoDocumento')?.value?.trim() || '';
    const telefono = document.getElementById('nuevoAsociadoTelefono')?.value?.trim() || '';
    const tipo = document.getElementById('nuevoAsociadoTipo')?.value || 'No_aforado';
    
    if (!documento || !nombre) return null;
    
    return {
        nombre,
        apellido,
        documento,
        telefono: telefono || null,
        tipo: tipo === 'Aforado' ? 'Aforado' : 'No_aforado'
    };
};

/**
 * Actualizar lista de items en modal de venta
 */
function actualizarListaItemsVenta() {
    // Buscar en cualquier modal de venta (ventaModal o nuevaVentaModal)
    const container = document.querySelector('#ventaModal .added-items, #nuevaVentaModal .added-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (itemsVenta.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay materiales agregados</p>';
        return;
    }
    
    itemsVenta.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'added-item';
        itemDiv.setAttribute('data-price-per-kg', item.precioPorKg);
        itemDiv.innerHTML = `
            <div class="added-item-info">
                <div class="added-item-name">${item.material.nombre}</div>
                <div class="added-item-code">ID - ${item.material.idMaterial}</div>
            </div>
            <div class="quantity-input">
                <span style="font-size: 0.875rem; color: #6b7280">Cantidad en Kg</span>
                <input type="number" value="${item.cantidad}" step="0.1" min="0" 
                       class="quantity-field" data-index="${index}" />
            </div>
            <span class="added-item-price">$${item.precioTotal.toLocaleString()}</span>
            <button class="remove-item" data-index="${index}" title="Eliminar">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
    
    // Agregar listeners
    container.querySelectorAll('.quantity-field').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            const cantidad = parseFloat(e.target.value) || 0;
            itemsVenta[index].cantidad = cantidad;
            itemsVenta[index].precioTotal = cantidad * itemsVenta[index].precioPorKg;
            actualizarListaItemsVenta();
        });
    });
    
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.remove-item').getAttribute('data-index'));
            itemsVenta.splice(index, 1);
            actualizarListaItemsVenta();
        });
    });
}

// Exportar funciones para dashboard-operaciones.js y app-compras.js/app-ventas.js
window.getItemsCompra = () => itemsCompra;
window.getItemsVenta = () => itemsVenta;
window.getAsociadoSeleccionadoCompra = () => asociadoSeleccionadoCompra;
window.getClienteSeleccionadoVenta = () => clienteSeleccionadoVenta;
window.getBarrioSeleccionadoCompra = () => null; // Se maneja en el modal
window.getBodegaSeleccionadaCompra = () => null; // Se maneja en el modal
window.getBodegaSeleccionadaVenta = () => null; // Se maneja en el modal
window.clearItemsCompra = () => { itemsCompra = []; if (typeof actualizarListaItemsCompra === 'function') actualizarListaItemsCompra(); };
window.clearItemsVenta = () => { itemsVenta = []; if (typeof actualizarListaItemsVenta === 'function') actualizarListaItemsVenta(); };

// Inicializar cuando el DOM esté listo o cuando se necesite
// Esto se ejecutará automáticamente, pero también puede ser llamado manualmente
function inicializarModalesSiNecesario() {
    if (typeof window.API === 'undefined') {
        console.warn('⚠️ API no disponible aún, reintentando...');
        setTimeout(inicializarModalesSiNecesario, 500);
        return;
    }
    
    // Solo inicializar si los modales existen en el DOM o si existe la sección en la página
    const modalCompra = document.getElementById('compraModal') || document.getElementById('nuevaCompraModal');
    const sectionCompra = document.getElementById('nuevaCompraSection');
    const modalVenta = document.getElementById('ventaModal') || document.getElementById('nuevaVentaModal');
    
    if ((modalCompra || sectionCompra) && !modalCompraInicializado) {
        inicializarModalCompra();
    }
    
    if (modalVenta && !modalVentaInicializado) {
        inicializarModalVenta();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(inicializarModalesSiNecesario, 500);
    });
} else {
    setTimeout(inicializarModalesSiNecesario, 500);
}

// También exponer la función para llamarla manualmente
window.inicializarModalesCompraVenta = inicializarModalesSiNecesario;
