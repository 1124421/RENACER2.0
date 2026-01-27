// Script para cargar modales de compras dinámicamente
function renacerInitModalesCompras() {
    const modalesContainer = document.getElementById('modales-compras-container');
    if (!modalesContainer) {
        console.warn('No se encontró el contenedor de modales (#modales-compras-container)');
        return;
    }

    const modalesMap = {
        'nuevaCompraModal': 'modales/compras/nueva-compra.html',
        'editarCompraModal': 'modales/compras/editar-compra.html',
        'modalVerCompra': 'modales/compras/ver-compra.html'
    };

    const modalesCargados = new Set();

    function cargarModal(modalId) {
        // Si el modal ya existe en el DOM, retornar inmediatamente
        if (document.getElementById(modalId)) {
            console.log(`✅ Modal ${modalId} ya existe en el DOM`);
            return Promise.resolve();
        }

        // Si ya se intentó cargar pero falló, no reintentar
        if (modalesCargados.has(modalId)) {
            const modal = document.getElementById(modalId);
            if (modal) {
                return Promise.resolve();
            }
        }

        const rutaModal = modalesMap[modalId];
        if (!rutaModal) {
            console.error(`No se encontró la ruta para el modal: ${modalId}`);
            return Promise.reject(`Modal ${modalId} no encontrado`);
        }

        console.log(`📦 Cargando modal ${modalId} desde ${rutaModal}`);
        
        return fetch(rutaModal)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el modal: ${response.statusText} (${response.status})`);
                }
                return response.text();
            })
            .then(html => {
                if (!html || html.trim() === '') {
                    throw new Error('El modal está vacío');
                }
                
                modalesContainer.insertAdjacentHTML('beforeend', html);
                modalesCargados.add(modalId);
                
                // Esperar un momento para que el DOM se actualice
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const modal = document.getElementById(modalId);
                        if (modal) {
                            modal.style.display = 'none';
                            modal.classList.remove('active');
                            console.log(`✅ Modal cargado y disponible: ${modalId}`);
                            resolve();
                        } else {
                            console.error(`❌ Modal ${modalId} no se encontró después de insertar HTML`);
                            resolve(); // Resolver de todas formas para no bloquear
                        }
                    }, 100);
                });
            })
            .catch(error => {
                console.error(`❌ Error al cargar el modal ${modalId}:`, error);
                modalesCargados.add(modalId); // Marcar como intentado para no reintentar infinitamente
                throw error;
            });
    }

    function cargarTodosLosModales() {
        const promesas = Object.keys(modalesMap).map(modalId => cargarModal(modalId));
        return Promise.all(promesas);
    }

    // Cargar todos los modales al inicio
    cargarTodosLosModales().then(() => {
        console.log('✅ Todos los modales de compras cargados');
        window.dispatchEvent(new CustomEvent('modales-compras-cargados'));
    }).catch(error => {
        console.error('❌ Error al cargar modales de compras:', error);
    });

    window.cargarModalCompra = cargarModal;
    console.log('✅ Cargador de modales de compras inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesCompras);
} else {
    renacerInitModalesCompras();
}

