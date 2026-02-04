// app-inventario.js
// Gestión del Inventario de Materiales

let currentEditItem = null;

async function inicializarInventario() {
    const tbody = document.getElementById('inventarioTbody');
    const searchInput = document.getElementById('searchInventario');
    
    if (!tbody) {
        console.error('No se encontró el tbody del inventario');
        return;
    }

    // Cargar inventario desde localStorage
    function cargarInventario() {
        const inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
        return inventario;
    }

    // Guardar inventario en localStorage
    function guardarInventario(inventario) {
        localStorage.setItem('inventario_materiales', JSON.stringify(inventario));
    }

    // Renderizar tabla
    function renderTable(inventario = null) {
        const datos = inventario || cargarInventario();
        tbody.innerHTML = '';

        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state" style="text-align: center; padding: 40px; color: #999;">No hay materiales en el inventario</td></tr>';
            return;
        }

        datos.forEach((item, index) => {
            const tr = document.createElement('tr');
            const fechaCreacion = item.fechaCreacion ? new Date(item.fechaCreacion) : new Date();
            const fechaCreacionFormateada = fechaCreacion.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const fechaModificacion = item.fechaModificacion ? new Date(item.fechaModificacion) : null;
            const fechaModificacionFormateada = fechaModificacion ? fechaModificacion.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';

            tr.innerHTML = `
                <td>${item.codigo || '-'}</td>
                <td>${item.nombreMaterial || item.descripcion || '-'}</td>
                <td>${item.categoria || '-'}</td>
                <td>$${item.precioUnidad ? item.precioUnidad.toLocaleString('es-ES', {minimumFractionDigits: 2}) : '0.00'}</td>
                <td>$${item.precioVenta ? item.precioVenta.toLocaleString('es-ES', {minimumFractionDigits: 2}) : '0.00'}</td>
                <td>${item.cantidad ? item.cantidad.toLocaleString('es-ES', {minimumFractionDigits: 2}) : '0.00'}</td>
                <td>${fechaCreacionFormateada}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" data-index="${index}" title="Editar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                        <button class="action-btn delete" data-index="${index}" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Agregar listeners a los botones de editar
        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                editarItem(index);
            });
        });
    }

    // Eliminar item
    function eliminarItem(index) {
        if (!confirm('¿Está seguro de eliminar este item del inventario?')) return;
        
        const inventario = cargarInventario();
        if (index < 0 || index >= inventario.length) return;
        
        inventario.splice(index, 1);
        guardarInventario(inventario);
        
        // Recargar tabla
        renderTable();
        
        // Mostrar mensaje de éxito
        if (typeof showSuccess === 'function') {
            showSuccess('Item eliminado correctamente');
        } else {
            alert('Item eliminado correctamente');
        }
    }

    // Editar item
    function editarItem(index) {
        const inventario = cargarInventario();
        if (index < 0 || index >= inventario.length) return;

        currentEditItem = { ...inventario[index], index };
        
        // Crear o mostrar modal de edición
        mostrarModalEdicion(currentEditItem);
    }

    // Mostrar modal de edición
    function mostrarModalEdicion(item) {
        // Crear modal si no existe
        let modal = document.getElementById('modalEditarInventario');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarInventario';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;';
            
            modal.innerHTML = `
                <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
                    <h2>Editar Item de Inventario</h2>
                    <form id="formEditarInventario">
                        <div style="margin-bottom: 15px;">
                            <label>Código:</label>
                            <input type="text" id="edit-codigo-inventario" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Nombre de Material:</label>
                            <input type="text" id="edit-descripcion-inventario" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Categoría:</label>
                            <input type="text" id="edit-categoria-inventario" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Precio por kilogramo:</label>
                            <input type="number" id="edit-precio-unidad-inventario" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Precio de venta:</label>
                            <input type="number" id="edit-precio-venta-inventario" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>Cantidad en kilogramo:</label>
                            <input type="number" id="edit-cantidad-inventario" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" id="cancelar-edicion-inventario" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancelar</button>
                            <button type="submit" style="padding: 10px 20px; border: none; background: #2d5a47; color: white; border-radius: 4px; cursor: pointer;">Guardar</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listeners
            document.getElementById('cancelar-edicion-inventario').addEventListener('click', () => {
                modal.style.display = 'none';
                currentEditItem = null;
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    currentEditItem = null;
                }
            });
            
            document.getElementById('formEditarInventario').addEventListener('submit', (e) => {
                e.preventDefault();
                guardarEdicion();
            });
        }
        
        // Llenar formulario
        document.getElementById('edit-codigo-inventario').value = item.codigo || '';
        document.getElementById('edit-descripcion-inventario').value = item.nombreMaterial || item.descripcion || '';
        document.getElementById('edit-categoria-inventario').value = item.categoria || '';
        document.getElementById('edit-precio-unidad-inventario').value = item.precioUnidad || '';
        document.getElementById('edit-precio-venta-inventario').value = item.precioVenta || '';
        document.getElementById('edit-cantidad-inventario').value = item.cantidad || '';
        
        modal.style.display = 'flex';
    }

    // Guardar edición
    function guardarEdicion() {
        if (!currentEditItem) return;
        
        const inventario = cargarInventario();
        const index = currentEditItem.index;
        
        if (index < 0 || index >= inventario.length) return;
        
        // Actualizar item
        inventario[index].codigo = document.getElementById('edit-codigo-inventario').value.trim();
        const nombreMaterialEditado = document.getElementById('edit-descripcion-inventario').value.trim();
        // Actualizar tanto nombreMaterial como descripcion para compatibilidad
        inventario[index].nombreMaterial = nombreMaterialEditado;
        inventario[index].descripcion = nombreMaterialEditado; // Mantener compatibilidad
        inventario[index].categoria = document.getElementById('edit-categoria-inventario').value.trim();
        inventario[index].precioUnidad = parseFloat(document.getElementById('edit-precio-unidad-inventario').value) || 0;
        inventario[index].precioVenta = parseFloat(document.getElementById('edit-precio-venta-inventario').value) || 0;
        inventario[index].cantidad = parseFloat(document.getElementById('edit-cantidad-inventario').value) || 0;
        inventario[index].fechaModificacion = new Date().toISOString();
        
        guardarInventario(inventario);
        
        // Cerrar modal
        document.getElementById('modalEditarInventario').style.display = 'none';
        currentEditItem = null;
        
        // Recargar tabla
        renderTable();
        
        // Mostrar mensaje de éxito
        if (typeof showSuccess === 'function') {
            showSuccess('Item actualizado correctamente');
        } else {
            alert('Item actualizado correctamente');
        }
    }

    // Filtrar inventario
    function filtrarInventario(termo) {
        const inventario = cargarInventario();
        if (!termo || termo.trim() === '') {
            return inventario;
        }

        const term = termo.toLowerCase();
        return inventario.filter(item => 
            (item.codigo && item.codigo.toLowerCase().includes(term)) ||
            (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
            (item.categoria && item.categoria.toLowerCase().includes(term))
        );
    }

    // Event listener para búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value;
            const filtrados = filtrarInventario(termo);
            renderTable(filtrados);
        });
    }

    // Cargar inventario inicial
    renderTable();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarInventario);
} else {
    inicializarInventario();
}
