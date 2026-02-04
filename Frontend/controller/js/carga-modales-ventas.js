// Script para cargar modales de ventas dinámicamente
function renacerInitModalesVentas() {
    const modalesContainer = document.getElementById('modales-ventas-container');
    if (!modalesContainer) {
        console.warn('No se encontró el contenedor de modales (#modales-ventas-container)');
        return;
    }

    const modalesMap = {
        'nuevaVentaModal': 'modales/ventas/nueva-venta.html',
        'editarVentaModal': 'modales/ventas/editar-venta.html',
        'modalVerVenta': 'modales/ventas/ver-venta.html'
    };

    const modalesCargados = new Set();

    function cargarModal(modalId) {
        if (document.getElementById(modalId)) {
            return Promise.resolve();
        }

        if (modalesCargados.has(modalId)) {
            return Promise.resolve();
        }

        const rutaModal = modalesMap[modalId];
        if (!rutaModal) {
            console.error(`No se encontró la ruta para el modal: ${modalId}`);
            return Promise.reject(`Modal ${modalId} no encontrado`);
        }

        return fetch(rutaModal)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el modal: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                modalesContainer.insertAdjacentHTML('beforeend', html);
                modalesCargados.add(modalId);
                
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                    console.log(`✅ Modal cargado: ${modalId}`);
                }
            })
            .catch(error => {
                console.error(`❌ Error al cargar el modal ${modalId}:`, error);
            });
    }

    function cargarTodosLosModales() {
        const promesas = Object.keys(modalesMap).map(modalId => cargarModal(modalId));
        return Promise.all(promesas);
    }

    // Cargar todos los modales al inicio
    cargarTodosLosModales().then(() => {
        console.log('✅ Todos los modales de ventas cargados');
        window.dispatchEvent(new CustomEvent('modales-ventas-cargados'));
    }).catch(error => {
        console.error('❌ Error al cargar modales de ventas:', error);
    });

    window.cargarModalVenta = cargarModal;
    console.log('✅ Cargador de modales de ventas inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesVentas);
} else {
    renacerInitModalesVentas();
}

