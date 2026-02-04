// Función para abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    }
}

// Función para cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Cerrar modal con la tecla ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
});