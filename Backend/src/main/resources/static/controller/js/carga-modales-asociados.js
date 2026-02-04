// Script para cargar modales de asociados dinámicamente desde archivos externos
function renacerInitModalesAsociados() {
    const modalesContainer = document.getElementById('modales-asociados-container');
    if (!modalesContainer) {
        console.warn('No se encontró el contenedor de modales (#modales-asociados-container)');
        return;
    }

    const modalesMap = {
        'asociadoModal': 'modales/asociados/nuevo-asociado.html',
        'editarAsociadoModal': 'modales/asociados/editar-asociado.html',
        'modalVer': 'modales/asociados/informacion-asociado.html'
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
                    modal.classList.remove('open');
                    modal.setAttribute('aria-hidden', 'true');
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
        console.log('✅ Todos los modales de asociados cargados');
        
        // Inicializar Flatpickr
        if (typeof flatpickr !== 'undefined') {
            const fpConfig = {
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
            };
            
            // Inicializar flatpickr en los campos de fecha
            const fechaInicioNuevo = document.getElementById('newFechaInicio');
            const fechaInicioEdit = document.getElementById('editFechaInicio');
            
            if (fechaInicioNuevo) {
                flatpickr(fechaInicioNuevo, fpConfig);
            }
            
            if (fechaInicioEdit) {
                flatpickr(fechaInicioEdit, fpConfig);
            }
        }
        
        // Configurar eventos para el modal Ver DESPUÉS de cargarlo
        const modalVer = document.getElementById('modalVer');
        if (modalVer) {
            // Cerrar al hacer clic fuera del modal
            modalVer.addEventListener('click', function(e) {
                if (e.target === modalVer) {
                    window.closeModal('modalVer');
                }
            });
            
            console.log('✅ Eventos del modal Ver configurados');
        }
        
        // Cerrar con la tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modalesAbiertos = document.querySelectorAll('.modal-overlay.open');
                modalesAbiertos.forEach(modal => {
                    window.closeModal(modal.id);
                });
            }
        });
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('modales-asociados-cargados'));
    }).catch(error => {
        console.error('❌ Error al cargar modales de asociados:', error);
    });

    window.cargarModalAsociado = cargarModal;
    console.log('✅ Cargador de modales de asociados inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesAsociados);
} else {
    renacerInitModalesAsociados();
}

// Función global para obtener iniciales del nombre
function getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
}