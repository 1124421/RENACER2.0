/**
 * Modal Manager - Gestor de modales para la aplicación
 * Proporciona funciones para abrir y cerrar modales
 */

(function() {
    'use strict';

    /**
     * Abre un modal por su ID
     * @param {string} modalId - ID del modal a abrir
     */
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal con ID "${modalId}" no encontrado`);
            return;
        }

        // Mostrar el modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Agregar overlay si no existe
        let overlay = document.getElementById('modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'modal-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            overlay.addEventListener('click', function(e) {
                // Solo cerrar si el click fue directamente en el overlay, no en el contenido del modal
                if (e.target === overlay) {
                    closeModal();
                }
            });
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    };

    /**
     * Cierra un modal por su ID
     * @param {string} modalId - ID del modal a cerrar (opcional, cierra todos si no se especifica)
     */
    window.closeModal = function(modalId) {
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        } else {
            // Cerrar todos los modales
            document.querySelectorAll('.modal, [id*="Modal"], [id*="modal"]').forEach(modal => {
                if (modal.style.display === 'flex' || modal.classList.contains('active')) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                }
            });
        }

        // Ocultar overlay
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        document.body.style.overflow = '';
    };

    // Cerrar modal al presionar ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            window.closeModal();
        }
    });

    // Cerrar modal al hacer clic en botones con data-close-modal
    document.addEventListener('click', function(event) {
        if (event.target.hasAttribute('data-close-modal')) {
            const modalId = event.target.getAttribute('data-close-modal');
            window.closeModal(modalId || null);
        }
    });

    console.log('✅ Modal Manager inicializado');
})();

