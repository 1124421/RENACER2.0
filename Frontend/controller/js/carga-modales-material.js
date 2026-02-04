// Script para cargar modales dinámicamente desde archivos externos para Material.html
function renacerInitModalesMaterial() {
    const modalesContainer = document.getElementById('modales-material-container');
    if (!modalesContainer) {
        console.warn('No se encontró el contenedor de modales (#modales-material-container)');
        return;
    }

    // Mapa de modales: ID del modal -> ruta del archivo
    // Las rutas son relativas desde VIEW/ donde están los archivos HTML
    // El script se ejecuta desde el contexto del HTML, así que las rutas son correctas
    const modalesMap = {
        'modalEditarMaterial': 'modales/material/editar-material.html'
    };

    // Cache para almacenar modales ya cargados
    const modalesCargados = new Set();

    // Función para cargar un modal específico
    function cargarModal(modalId) {
        // Si el modal ya está en el DOM, no hacer nada
        if (document.getElementById(modalId)) {
            return Promise.resolve();
        }

        // Si ya se cargó antes, no volver a cargar
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
                // Insertar el HTML del modal en el contenedor
                modalesContainer.insertAdjacentHTML('beforeend', html);
                modalesCargados.add(modalId);
                
                // Inicializar el modal recién cargado
                const modal = document.getElementById(modalId);
                if (modal) {
                    // Asegurar que el modal esté oculto inicialmente
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                    
                    console.log(`✅ Modal cargado: ${modalId}`);
                }
            })
            .catch(error => {
                console.error(`❌ Error al cargar el modal ${modalId}:`, error);
            });
    }

    // Función para cargar todos los modales de materiales
    function cargarTodosLosModales() {
        const promesas = Object.keys(modalesMap).map(modalId => cargarModal(modalId));
        return Promise.all(promesas);
    }

    // Cargar todos los modales al inicio
    cargarTodosLosModales().then(() => {
        console.log('✅ Todos los modales de materiales cargados');
        
        // Disparar un evento personalizado para notificar que los modales están listos
        window.dispatchEvent(new CustomEvent('modales-material-cargados'));
    }).catch(error => {
        console.error('❌ Error al cargar modales de materiales:', error);
    });

    // Exponer función para cargar modales bajo demanda si es necesario
    window.cargarModalMaterial = cargarModal;

    console.log('✅ Cargador de modales de materiales inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesMaterial);
} else {
    renacerInitModalesMaterial();
}

