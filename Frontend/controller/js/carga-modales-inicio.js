// Script para cargar modales dinámicamente desde archivos externos
function renacerInitModalesInicio() {
    const modalesContainer = document.getElementById('modales-inicio-container');
    if (!modalesContainer) {
        console.warn('No se encontró el contenedor de modales (#modales-inicio-container)');
        return;
    }

    // Mapa de modales: ID del modal -> ruta del archivo
    // Las rutas son relativas desde VIEW/ donde están los archivos HTML
    // El script se ejecuta desde el contexto del HTML, así que las rutas son correctas
    const modalesMap = {
        'compraModal': 'modales/inicio/modal-compra.html',
        'ventaModal': 'modales/inicio/modal-venta.html',
        'asociadoModal': 'modales/inicio/modal-asociado.html'
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
                    
                    // Inicializar Flatpickr si hay inputs de fecha en el modal
                    if (typeof flatpickr !== 'undefined' && modalId === 'asociadoModal') {
                        flatpickr('#fechaInicioModalInicio', {
                            locale: 'es',
                            dateFormat: 'd/m/Y',
                            onOpen: function(selectedDates, dateStr, instance) {
                                const input = instance.input;
                                const calendar = instance.calendarContainer;
                                
                                const updatePosition = () => {
                                    const rect = input.getBoundingClientRect();
                                    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                                    calendar.style.position = 'absolute';
                                    calendar.style.top = `${rect.bottom + scrollY + 8}px`;
                                    calendar.style.left = `${rect.left}px`;
                                    calendar.style.zIndex = '99999';
                                };
                                
                                const track = () => {
                                    updatePosition();
                                    instance._positionTracker = requestAnimationFrame(track);
                                };
                                
                                track();
                            },
                            onClose: function(selectedDates, dateStr, instance) {
                                if (instance._positionTracker) {
                                    cancelAnimationFrame(instance._positionTracker);
                                }
                            }
                        });
                    }
                    
                    // Si existe modal-manager, inicializar el nuevo modal
                    if (typeof window.initModals === 'function') {
                        window.initModals();
                    }
                    
                    console.log(`✅ Modal cargado: ${modalId}`);
                }
            })
            .catch(error => {
                console.error(`❌ Error al cargar el modal ${modalId}:`, error);
            });
    }

    // Interceptar la función openModal para cargar modales bajo demanda
    // Esperar a que modal-manager.js haya definido la función
    function interceptarOpenModal() {
        // Guardar referencia a la función original
        const openModalOriginal = window.openModal;
        
        // Crear nueva función que intercepta las llamadas
        window.openModal = function(modalId) {
            // Verificar si el modal existe en el mapa
            if (modalesMap[modalId]) {
                // Cargar el modal si no está cargado
                cargarModal(modalId).then(() => {
                    // Pequeño delay para asegurar que el DOM se actualizó
                    requestAnimationFrame(() => {
                        // Una vez cargado, abrir el modal usando la función original
                        if (openModalOriginal && typeof openModalOriginal === 'function') {
                            openModalOriginal(modalId);
                        } else {
                            // Fallback si no existe la función original
                            const modal = document.getElementById(modalId);
                            if (modal) {
                                modal.style.display = 'flex';
                                modal.classList.add('active');
                                document.body.style.overflow = 'hidden';
                            }
                        }
                    });
                }).catch(error => {
                    console.error(`Error al abrir el modal ${modalId}:`, error);
                });
            } else {
                // Si no está en el mapa, usar la función original directamente
                if (openModalOriginal && typeof openModalOriginal === 'function') {
                    openModalOriginal(modalId);
                }
            }
        };
    }

    // Esperar a que openModal esté disponible (modal-manager.js lo define)
    function esperarOpenModal() {
        if (window.openModal && typeof window.openModal === 'function') {
            interceptarOpenModal();
        } else {
            // Reintentar después de un breve delay
            setTimeout(esperarOpenModal, 50);
        }
    }

    // Iniciar la espera
    esperarOpenModal();

    console.log('✅ Cargador de modales de inicio inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesInicio);
} else {
    renacerInitModalesInicio();
}

