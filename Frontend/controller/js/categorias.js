/**
 * Módulo de Gestión de Categorías
 * Categorías como carpetas con materiales por categoría
 */

let categoriasInicializado = false;
let categoriasList = [];
let materialesList = [];
let inventarioList = [];
let categoriaSeleccionada = null;
let currentEditMaterial = null;

if (typeof window.API === 'undefined') {
    console.error('❌ API module no está cargado.');
}

async function inicializarCategorias() {
    if (categoriasInicializado) return;

    const modalCategoria = document.getElementById('modalCategoria');
    const btnAgregarCategoria = document.getElementById('btnAgregarCategoria');
    const closeCategoria = document.getElementById('closeCategoria');
    const buscadorCategorias = document.getElementById('buscadorCategorias');

    if (!modalCategoria || !btnAgregarCategoria) {
        console.warn('Elementos necesarios no disponibles');
        return;
    }

    categoriasInicializado = true;

    async function cargarCategorias() {
        try {
            if (typeof window.API !== 'undefined') {
                const response = await window.API.CategoriaMaterial.getAll();
                if (response && response.success) {
                    categoriasList = response.data || [];
                } else {
                    categoriasList = [];
                }
            } else {
                categoriasList = [];
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            categoriasList = [];
        }
        renderCategoriasFolders(buscadorCategorias?.value?.trim() || '');
    }

    async function cargarMateriales() {
        try {
            if (typeof window.API !== 'undefined') {
                const response = await window.API.Material.getAll();
                if (response && response.success) {
                    materialesList = response.data || [];
                } else {
                    materialesList = [];
                }
            } else {
                materialesList = [];
            }
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            materialesList = [];
        }
    }

    async function cargarInventario() {
        inventarioList = [];
        try {
            if (typeof window.API !== 'undefined') {
                const response = await fetch('http://localhost:8080/api/inventario', {
                    headers: window.API && typeof window.getAuthHeaders === 'function'
                        ? window.getAuthHeaders() : { 'Content-Type': 'application/json' },
                    credentials: 'omit'
                });
                if (response.ok) inventarioList = await response.json();
            }
        } catch (error) {
            console.warn('No se pudo cargar inventario:', error);
        }
    }

    function renderCategoriasFolders(filtro = '') {
        const grid = document.getElementById('categoriasFoldersGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const categoriasFiltradas = categoriasList.filter(cat => {
            const nombre = (cat.nombre || cat.nombreCategoria || '').toLowerCase();
            return !filtro || nombre.includes(filtro.toLowerCase());
        });

        if (categoriasFiltradas.length === 0) {
            grid.innerHTML = '<p style="color: #999; grid-column: 1/-1; padding: 15px;">' +
                (filtro ? 'No se encontraron categorías' : 'No hay categorías. Agregue una categoría para comenzar.') + '</p>';
            return;
        }

        categoriasFiltradas.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'categoria-folder-card' + (categoriaSeleccionada?.idCategoria === cat.idCategoria ? ' expandida' : '');
            card.dataset.id = cat.idCategoria;
            card.dataset.nombre = cat.nombre || cat.nombreCategoria || '';
            card.innerHTML = `
                <button type="button" class="categoria-folder-edit" title="Editar categoría">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <div class="categoria-folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <span class="categoria-folder-name">${(cat.nombre || cat.nombreCategoria || '').trim() || 'Sin nombre'}</span>
            `;

            const editBtn = card.querySelector('.categoria-folder-edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalEditarCategoria(cat);
            });

            card.addEventListener('click', (e) => {
                if (e.target.closest('.categoria-folder-edit')) return;
                toggleCategoriaExpandida(cat);
            });

            grid.appendChild(card);
        });
    }

    async function toggleCategoriaExpandida(categoria) {
        if (categoriaSeleccionada?.idCategoria === categoria.idCategoria) {
            categoriaSeleccionada = null;
            document.getElementById('materialesCategoriaSection').style.display = 'none';
        } else {
            categoriaSeleccionada = categoria;
            await cargarMateriales();
            await cargarInventario();
            renderMaterialesCategoria(categoria);
            document.getElementById('materialesCategoriaSection').style.display = 'block';
            document.getElementById('categoriaNombreActual').textContent = categoria.nombre || categoria.nombreCategoria || 'Sin nombre';
        }
        renderCategoriasFolders(buscadorCategorias?.value?.trim() || '');
    }

    function renderMaterialesCategoria(categoria) {
        const lista = document.getElementById('materialesCategoriaLista');
        if (!lista) return;

        const materialesDeCategoria = materialesList.filter(m =>
            m.categoria?.idCategoria === categoria.idCategoria || m.categoria?.nombre === (categoria.nombre || categoria.nombreCategoria)
        );

        if (materialesDeCategoria.length === 0) {
            lista.innerHTML = '<p class="mensaje-sin-materiales">No hay materiales en esta categoría.</p>';
            return;
        }

        const inventarioLocal = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');

        let html = `
            <table class="materiales-tabla">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Precio por unidad</th>
                        <th>Precio de venta</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        materialesDeCategoria.forEach(material => {
            const stockItem = inventarioList.find(inv => inv.material?.idMaterial === material.idMaterial);
            const stock = stockItem ? parseFloat(stockItem.cantidadTotal || 0) : 0;
            const invLocal = inventarioLocal.find(i => i.idMaterial === material.idMaterial);
            const codigo = invLocal?.codigo || material.idMaterial;
            const precioUnidad = invLocal?.precioUnidad ?? '-';
            const precioVenta = invLocal?.precioVenta ?? '-';

            html += `
                <tr>
                    <td>${codigo}</td>
                    <td>${material.nombre || '-'}</td>
                    <td>${typeof precioUnidad === 'number' ? '$' + precioUnidad.toFixed(2) : precioUnidad}</td>
                    <td>${typeof precioVenta === 'number' ? '$' + precioVenta.toFixed(2) : precioVenta}</td>
                    <td>${stock.toFixed(2)}</td>
                    <td>
                        <div class="acciones-material">
                            <button class="action-btn edit" data-material-id="${material.idMaterial}" title="Editar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29L3,17.25V21H6.75L17.81,9.93L14.06,6.18M15.12,5.12L18.87,8.87L20.71,7.04L16.96,3.29L15.12,5.12Z"/>
                                </svg>
                            </button>
                            <button class="action-btn delete" data-material-id="${material.idMaterial}" title="Eliminar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        lista.innerHTML = html;

        lista.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-material-id'));
                const material = materialesList.find(m => m.idMaterial === id);
                if (material) abrirModalEditarMaterial(material);
            });
        });

        lista.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-material-id'));
                if (!confirm('¿Está seguro de que desea eliminar este material?')) return;
                try {
                    if (typeof window.API !== 'undefined') {
                        await window.API.Material.delete(id);
                        if (typeof showSuccess === 'function') showSuccess('Material eliminado');
                        await cargarMateriales();
                        renderMaterialesCategoria(categoriaSeleccionada);
                    }
                } catch (err) {
                    if (typeof showError === 'function') showError(err.message || 'Error al eliminar');
                }
            });
        });
    }

    function abrirModalEditarMaterial(material) {
        const modal = document.getElementById('modalEditarMaterial');
        if (!modal) return;
        currentEditMaterial = material;
        const editDescripcion = document.getElementById('edit-descripcion');
        const editCategoria = document.getElementById('edit-categoria');
        const editCodigo = document.getElementById('edit-codigo');
        const editPrecioUnidad = document.getElementById('edit-precio-unidad');
        const editPrecioVenta = document.getElementById('edit-precio-venta');
        const editCantidad = document.getElementById('edit-cantidad');
        if (editCategoria && categoriasList.length > 0) {
            editCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            categoriasList.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.idCategoria;
                opt.textContent = cat.nombre || cat.nombreCategoria || '';
                editCategoria.appendChild(opt);
            });
        }
        if (editDescripcion) editDescripcion.value = material.nombre || '';
        if (editCodigo) editCodigo.value = material.idMaterial || '';
        if (editCategoria) editCategoria.value = material.categoria?.idCategoria || '';
        const invLocal = JSON.parse(localStorage.getItem('inventario_materiales') || '[]').find(i => i.idMaterial === material.idMaterial);
        if (editPrecioUnidad) editPrecioUnidad.value = invLocal?.precioUnidad ?? '';
        if (editPrecioVenta) editPrecioVenta.value = invLocal?.precioVenta ?? '';
        const stockItem = inventarioList.find(inv => inv.material?.idMaterial === material.idMaterial);
        if (editCantidad) editCantidad.value = stockItem ? stockItem.cantidadTotal : '';
        modal.style.display = 'flex';
    }

    function abrirModalEditarCategoria(categoria) {
        const modal = document.getElementById('modalCategoria');
        const form = document.getElementById('formCategoria');
        const titulo = modal?.querySelector('h2');
        const inputNombre = document.getElementById('nombre-categoria');
        const btnSubmit = form?.querySelector('button[type="submit"]');
        if (!modal || !form || !inputNombre) return;
        titulo.textContent = 'Editar categoría';
        btnSubmit.textContent = 'Guardar cambios';
        inputNombre.value = categoria.nombre || categoria.nombreCategoria || '';
        form.dataset.editandoCategoriaId = categoria.idCategoria;
        modal.style.display = 'flex';
    }

    function resetModalCategoriaModoAgregar() {
        const form = document.getElementById('formCategoria');
        const titulo = document.querySelector('#modalCategoria h2');
        const inputNombre = document.getElementById('nombre-categoria');
        const btnSubmit = form?.querySelector('button[type="submit"]');
        if (titulo) titulo.textContent = 'Agregar nueva categoría';
        if (btnSubmit) btnSubmit.textContent = 'Guardar categoría';
        if (inputNombre) inputNombre.value = '';
        if (form) delete form.dataset.editandoCategoriaId;
    }

    btnAgregarCategoria.addEventListener('click', () => {
        resetModalCategoriaModoAgregar();
        modalCategoria.style.display = 'flex';
    });

    if (closeCategoria) {
        closeCategoria.addEventListener('click', () => {
            resetModalCategoriaModoAgregar();
            modalCategoria.style.display = 'none';
        });
    }

    document.getElementById('btnCerrarMateriales')?.addEventListener('click', () => {
        categoriaSeleccionada = null;
        document.getElementById('materialesCategoriaSection').style.display = 'none';
        renderCategoriasFolders(buscadorCategorias?.value?.trim() || '');
    });

    buscadorCategorias?.addEventListener('input', (e) => {
        renderCategoriasFolders(e.target.value.trim());
    });

    window.addEventListener('click', (e) => {
        if (e.target === modalCategoria) {
            resetModalCategoriaModoAgregar();
            modalCategoria.style.display = 'none';
        }
    });

    const formCategoria = document.getElementById('formCategoria');
    if (formCategoria && !formCategoria.dataset.listenerAdded) {
        formCategoria.dataset.listenerAdded = 'true';
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombreCategoria = document.getElementById('nombre-categoria').value.trim();
            const editandoId = formCategoria.dataset.editandoCategoriaId;

            if (!nombreCategoria) {
                if (typeof showError === 'function') showError('Ingrese un nombre para la categoría');
                else alert('Ingrese un nombre para la categoría');
                return false;
            }

            try {
                if (typeof window.API !== 'undefined') {
                    if (editandoId) {
                        const response = await window.API.CategoriaMaterial.update(parseInt(editandoId), { nombre: nombreCategoria });
                        if (response && response.success) {
                            resetModalCategoriaModoAgregar();
                            modalCategoria.style.display = 'none';
                            await cargarCategorias();
                            if (typeof showSuccess === 'function') showSuccess('Categoría actualizada');
                        } else throw new Error(response?.message || 'Error');
                    } else {
                        const response = await window.API.CategoriaMaterial.create({ nombre: nombreCategoria });
                        if (response && response.success) {
                            resetModalCategoriaModoAgregar();
                            modalCategoria.style.display = 'none';
                            await cargarCategorias();
                            if (typeof showSuccess === 'function') showSuccess('Categoría guardada');
                        } else throw new Error(response?.message || 'Error');
                    }
                }
            } catch (error) {
                if (typeof showError === 'function') showError(error.message || 'Error al guardar');
                else alert('Error: ' + error.message);
            }
            return false;
        });
    }

    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
        if (username && password) {
        await cargarCategorias();
    }

        // Modal editar material
        const modalEditarMaterial = document.getElementById('modalEditarMaterial');
        const closeEditarMaterial = document.getElementById('closeEditarMaterial');
        const formEditarMaterial = document.getElementById('formEditarMaterial');

        if (closeEditarMaterial) {
            closeEditarMaterial.addEventListener('click', () => {
                if (modalEditarMaterial) modalEditarMaterial.style.display = 'none';
                currentEditMaterial = null;
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modalEditarMaterial) {
                modalEditarMaterial.style.display = 'none';
                currentEditMaterial = null;
            }
        });

        if (formEditarMaterial && !formEditarMaterial.dataset.listenerAdded) {
            formEditarMaterial.dataset.listenerAdded = 'true';
            formEditarMaterial.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!currentEditMaterial) return;
                const nombre = document.getElementById('edit-descripcion')?.value?.trim() || '';
                const categoriaId = document.getElementById('edit-categoria')?.value || '';
                if (!nombre || !categoriaId) {
                    if (typeof showError === 'function') showError('Complete todos los campos');
                    return;
                }
                try {
                    const categoria = categoriasList.find(c => c.idCategoria == categoriaId);
                    await window.API.Material.update(currentEditMaterial.idMaterial, {
                        nombre,
                        categoria: { idCategoria: parseInt(categoriaId) }
                    });
                    modalEditarMaterial.style.display = 'none';
                    currentEditMaterial = null;
                    await cargarMateriales();
                    await cargarInventario();
                    if (categoriaSeleccionada) renderMaterialesCategoria(categoriaSeleccionada);
                    if (typeof showSuccess === 'function') showSuccess('Material actualizado');
                } catch (err) {
                    if (typeof showError === 'function') showError(err.message || 'Error al actualizar');
                }
            });
        }
    }

if (document.readyState === 'loading') {
    window.addEventListener('modales-categorias-cargados', () => { if (!categoriasInicializado) inicializarCategorias(); }, { once: true });
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (!categoriasInicializado) inicializarCategorias(); }, 100));
} else {
    window.addEventListener('modales-categorias-cargados', () => { if (!categoriasInicializado) inicializarCategorias(); }, { once: true });
    setTimeout(() => { if (!categoriasInicializado) inicializarCategorias(); }, 200);
}
