// Script para cargar modales en Categorias.html
function renacerInitModalesCategorias() {
    const modalesContainer = document.getElementById('modales-categorias-container');
    if (!modalesContainer) return;

    const modalesMap = {
        'modalCategoria': 'modales/material/categoria.html',
        'modalEditarMaterial': 'modales/material/editar-material.html'
    };

    function cargarModal(modalId) {
        if (document.getElementById(modalId)) return Promise.resolve();

        const rutaModal = modalesMap[modalId];
        if (!rutaModal) return Promise.reject(`Modal ${modalId} no encontrado`);

        return fetch(rutaModal)
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar modal: ${response.statusText}`);
                return response.text();
            })
            .then(html => {
                modalesContainer.insertAdjacentHTML('beforeend', html);
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'none';
                console.log(`✅ Modal cargado: ${modalId}`);
            });
    }

    Promise.all([
        cargarModal('modalCategoria'),
        cargarModal('modalEditarMaterial')
    ]).then(() => {
        window.dispatchEvent(new CustomEvent('modales-categorias-cargados'));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitModalesCategorias);
} else {
    renacerInitModalesCategorias();
}
