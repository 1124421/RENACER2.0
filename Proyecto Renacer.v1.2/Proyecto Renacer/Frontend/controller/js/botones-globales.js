/**
 * Script global para manejar los botones de "Nuevo" en toda la aplicación
 * Se ejecuta temprano y captura clicks en los botones principales
 */

(function() {
    'use strict';
    
    console.log('🚀 Inicializando botones globales...');
    
    // Función para manejar click en botón de nueva compra
    async function handleNuevaCompra(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Click en +Nueva compra (global)');
        
        // Si existe la sección en la página (nueva interfaz), usar esa en lugar del modal
        const nuevaCompraSection = document.getElementById('nuevaCompraSection');
        if (nuevaCompraSection && typeof window.showSectionCompras === 'function') {
            console.log('📄 Usando sección de página en lugar de modal');
            window.showSectionCompras('nuevaCompra');
            return;
        }
        
        // Si no hay sección, usar el modal (comportamiento antiguo)
        let modal = document.getElementById('nuevaCompraModal');
        if (!modal) {
            console.log('📦 Modal no encontrado, intentando cargar...');
            if (window.cargarModalCompra) {
                try {
                    await window.cargarModalCompra('nuevaCompraModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaCompraModal');
                } catch (error) {
                    console.error('❌ Error al cargar modal:', error);
                }
            } else {
                console.error('❌ cargarModalCompra no disponible');
                alert('El modal no se pudo cargar. Por favor, recargue la página.');
                return;
            }
        }
        
        if (!modal) {
            console.error('❌ Modal nuevaCompraModal aún no disponible');
            alert('El modal no se pudo cargar. Por favor, recargue la página.');
            return;
        }
        
        // Inicializar modal si es necesario (para búsquedas y funcionalidades)
        if (typeof window.inicializarModalesCompraVenta === 'function') {
            window.inicializarModalesCompraVenta();
        }
        
        // Limpiar formulario
        if (window.clearItemsCompra) window.clearItemsCompra();
        const searchAsociado = document.getElementById('searchAsociadoCompra');
        const searchMaterial = document.getElementById('searchMaterialCompra');
        const carretaInput = document.getElementById('carretaNuevaCompra');
        const barrioSelect = document.getElementById('barrioNuevaCompra');
        if (searchAsociado) searchAsociado.value = '';
        if (searchMaterial) searchMaterial.value = '';
        if (carretaInput) carretaInput.value = '';
        if (barrioSelect) barrioSelect.value = '';
        
        // Cargar selectores si la función existe
        if (typeof window.cargarSelectoresNuevaCompra === 'function') {
            await window.cargarSelectoresNuevaCompra();
        }
        
        // Abrir modal
        console.log('🔓 Abriendo modal nuevaCompraModal');
        if (window.openModal) {
            window.openModal('nuevaCompraModal');
        } else {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
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
                    
                    console.log('🔘 CLICK EN BOTÓN FINALIZAR COMPRA - DESDE botones-globales.js');
                    
                    // Intentar múltiples formas de llamar la función
                    if (typeof window.guardarNuevaCompra === 'function') {
                        await window.guardarNuevaCompra();
                    } else if (typeof guardarNuevaCompra === 'function') {
                        await guardarNuevaCompra();
                    } else {
                        console.error('❌ window.guardarNuevaCompra no disponible, esperando...');
                        // Esperar un poco y reintentar (por si aún se está cargando)
                        setTimeout(async () => {
                            if (typeof window.guardarNuevaCompra === 'function') {
                                await window.guardarNuevaCompra();
                            } else {
                                console.error('❌ window.guardarNuevaCompra aún no disponible después de esperar');
                            }
                        }, 500);
                    }
                }, true);
                console.log('✅ Listener agregado desde botones-globales.js');
            }
        }, 200);
    }
    
    // Función para manejar click en botón de nueva venta
    async function handleNuevaVenta(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Click en +Nueva venta (global)');
        
        // Cargar modal si no existe
        let modal = document.getElementById('nuevaVentaModal');
        if (!modal) {
            console.log('📦 Modal no encontrado, intentando cargar...');
            if (window.cargarModalVenta) {
                try {
                    await window.cargarModalVenta('nuevaVentaModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('nuevaVentaModal');
                } catch (error) {
                    console.error('❌ Error al cargar modal:', error);
                }
            } else {
                console.error('❌ cargarModalVenta no disponible');
                alert('El modal no se pudo cargar. Por favor, recargue la página.');
                return;
            }
        }
        
        if (!modal) {
            console.error('❌ Modal nuevaVentaModal aún no disponible');
            alert('El modal no se pudo cargar. Por favor, recargue la página.');
            return;
        }
        
        // Inicializar modal si es necesario (para búsquedas y funcionalidades)
        if (typeof window.inicializarModalesCompraVenta === 'function') {
            window.inicializarModalesCompraVenta();
        }
        
        // Limpiar formulario
        if (window.clearItemsVenta) window.clearItemsVenta();
        const searchCliente = document.getElementById('searchClienteVenta');
        const searchMaterial = document.getElementById('searchMaterialVenta');
        const bodegaSelect = document.getElementById('bodegaNuevaVenta');
        if (searchCliente) searchCliente.value = '';
        if (searchMaterial) searchMaterial.value = '';
        if (bodegaSelect) bodegaSelect.value = '';
        
        // Cargar selectores si la función existe
        if (typeof window.cargarSelectoresNuevaVenta === 'function') {
            await window.cargarSelectoresNuevaVenta();
        }
        
        // Abrir modal
        console.log('🔓 Abriendo modal nuevaVentaModal');
        if (window.openModal) {
            window.openModal('nuevaVentaModal');
        } else {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para manejar click en botón de nuevo asociado
    async function handleNuevoAsociado(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Click en +Nuevo asociado (global)');
        
        // Cargar modal si no existe
        let modal = document.getElementById('asociadoModal');
        if (!modal) {
            console.log('📦 Modal no encontrado, intentando cargar...');
            if (window.cargarModalAsociado) {
                try {
                    await window.cargarModalAsociado('asociadoModal');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    modal = document.getElementById('asociadoModal');
                } catch (error) {
                    console.error('❌ Error al cargar modal:', error);
                }
            }
            
            if (!modal) {
                console.error('❌ Modal asociadoModal aún no disponible');
                return;
            }
        }
        
        // Limpiar formulario (excepto fecha actual que se establece automáticamente)
        const fields = ['newNombre', 'newDocumento', 'newContacto', 'newCorreo', 'newCarreta', 'newRuta', 'newIdUnico', 'newTipoAsociado'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Establecer fecha actual automáticamente
        const fechaInicioInput = document.getElementById('newFechaInicio');
        if (fechaInicioInput) {
            const ahora = new Date();
            const dia = String(ahora.getDate()).padStart(2, '0');
            const mes = String(ahora.getMonth() + 1).padStart(2, '0');
            const año = ahora.getFullYear();
            fechaInicioInput.value = `${dia}/${mes}/${año}`;
        }
        
        // Abrir modal
        console.log('🔓 Abriendo modal asociadoModal');
        if (window.openModal) {
            window.openModal('asociadoModal');
        } else {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para manejar click en botón de nuevo material
    function handleNuevoMaterial(e) {
        // NO prevenir el comportamiento por defecto - dejar que material.js lo maneje
        console.log('🖱️ Click en Nuevo material (global) - delegando a material.js');
        
        // Si existe la función showSection global, usarla
        if (typeof window.showSection === 'function') {
            window.showSection('form');
            return;
        }
        
        // Buscar la sección de formulario y mostrarla manualmente si showSection no existe
        const formSection = document.getElementById('formSection');
        const inventorySection = document.getElementById('inventorySection');
        const btnNuevoMaterial = document.getElementById('btnNuevoMaterial');
        const btnInventario = document.getElementById('btnInventario');
        
        if (formSection) {
            formSection.style.display = 'block';
            if (inventorySection) inventorySection.style.display = 'none';
            if (btnNuevoMaterial) btnNuevoMaterial.classList.add('active');
            if (btnInventario) btnInventario.classList.remove('active');
        }
    }
    
    // Event delegation global - captura clicks en todos los botones
    function setupEventDelegation() {
        document.addEventListener('click', function(e) {
            // Verificar si el click fue en un botón o dentro de un botón
            const target = e.target;
            const button = target.closest ? target.closest('button') : null;
            
            if (!button) return;
            
            // Obtener el ID del botón
            const buttonId = button.id;
            
            // Evitar doble ejecución
            if (button.dataset && button.dataset.botonesGlobalesProcesado) {
                return;
            }
            
            // Botón Nueva Compra
            if (buttonId === 'btnNuevaCompra') {
                if (button.dataset) button.dataset.botonesGlobalesProcesado = 'true';
                console.log('🔘 Click detectado en btnNuevaCompra');
                handleNuevaCompra(e);
                setTimeout(() => {
                    if (button.dataset) delete button.dataset.botonesGlobalesProcesado;
                }, 1000);
                return;
            }
            
            // Botón Nueva Venta
            if (buttonId === 'btnNuevaVenta') {
                if (button.dataset) button.dataset.botonesGlobalesProcesado = 'true';
                console.log('🔘 Click detectado en btnNuevaVenta');
                handleNuevaVenta(e);
                setTimeout(() => {
                    if (button.dataset) delete button.dataset.botonesGlobalesProcesado;
                }, 1000);
                return;
            }
            
            // Botón Nuevo Asociado
            if (buttonId === 'btnNuevo') {
                if (button.dataset) button.dataset.botonesGlobalesProcesado = 'true';
                console.log('🔘 Click detectado en btnNuevo');
                handleNuevoAsociado(e);
                setTimeout(() => {
                    if (button.dataset) delete button.dataset.botonesGlobalesProcesado;
                }, 1000);
                return;
            }
            
            // Botón Nuevo Material - NO manejar aquí, dejar que material.js lo maneje completamente
            // Simplemente no hacer nada y permitir que el evento continúe
            if (buttonId === 'btnNuevoMaterial') {
                // No hacer nada - material.js lo manejará
                return; // Permitir que el evento continúe sin procesar
            }
        }, true); // Usar capture phase para asegurar que se ejecute primero
        
        console.log('✅ Event delegation global configurado');
    }
    
    // Inicializar inmediatamente
    setupEventDelegation();
    
    console.log('✅ Botones globales inicializados - Event delegation activo');
})();
