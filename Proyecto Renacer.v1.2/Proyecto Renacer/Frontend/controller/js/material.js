/**
 * ============================================
 * INICIALIZACIÓN DE MATERIALES
 * Gestiona la funcionalidad del módulo de materiales con conexión al backend
 * ============================================
 */

// Variable para prevenir múltiples inicializaciones
let materialesInicializado = false;
let materialesList = [];
let categoriasList = [];
let nombresMaterialList = [];

// Verificar que la API esté cargada
if (typeof window.API === 'undefined') {
    console.error('❌ API module no está cargado. Asegúrate de incluir api.js antes de este script.');
}

// Esperar a que los modales estén cargados antes de inicializar
async function inicializarMateriales() {
    // Prevenir múltiples inicializaciones
    if (materialesInicializado) {
        console.log('Materiales ya inicializado, omitiendo...');
        return;
    }
    
    const modalCategoria = document.getElementById("modalCategoria");
    const modalNombreMaterial = document.getElementById("modalNombreMaterial");
    const modalEditarMaterial = document.getElementById("modalEditarMaterial");
    const btnCategoria = document.getElementById("btnCategoria");
    const btnNombreMaterial = document.getElementById("btnNombreMaterial");
    const btnNuevoMaterial = document.getElementById("btnNuevoMaterial");
    const btnEditar = document.getElementById("btnEditar");
    const closeCategoria = document.getElementById("closeCategoria");
    const closeNombreMaterial = document.getElementById("closeNombreMaterial");
    const closeEditarMaterial = document.getElementById("closeEditarMaterial");
    const formSection = document.getElementById("formSection");
    
    // Verificar que los elementos existan (permitir que modalNombreMaterial sea null inicialmente)
    if (!modalCategoria || !modalEditarMaterial || !btnCategoria || !btnNuevoMaterial) {
        console.warn('Algunos elementos necesarios no están disponibles aún');
        return;
    }
    
    // Marcar como inicializado
    materialesInicializado = true;
    
    let currentEditRow = null;
    let currentEditMaterial = null;

    // Función para cambiar entre secciones - Hacerla global para que botones-globales.js pueda usarla
    window.showSection = function(section) {
        console.log('🔧 showSection llamado con:', section);
        
        if (!formSection) {
            console.error('❌ formSection no está disponible');
            return;
        }
        
        if (section === 'form') {
            formSection.style.display = 'block';
            formSection.style.visibility = 'visible';
            formSection.style.opacity = '1';
            
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            if (btnNuevoMaterial) {
                btnNuevoMaterial.classList.add('active');
            }
            
            console.log('✅ Sección form mostrada');
        }
    };

    // Event listeners para los tabs - Usar delegación de eventos para evitar problemas
    const tabsContainer = document.querySelector('.tabs');
    console.log('🔍 tabsContainer encontrado:', !!tabsContainer);
    
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.tab-btn');
            console.log('🔍 Click en tabsContainer, target:', target?.id);
            if (!target) return;
            
            if (target.id === 'btnNuevoMaterial') {
                console.log('✅ Botón Nuevo Material clickeado (material.js)');
                e.preventDefault();
                e.stopPropagation();
                
                // Forzar mostrar el formulario inmediatamente
                const fs = document.getElementById('formSection');
                const btn = document.getElementById('btnNuevoMaterial');
                
                
                // Mostrar formulario con animación suave
                if (fs) {
                    fs.style.display = 'block';
                    fs.style.visibility = 'visible';
                    fs.style.opacity = '1';
                    fs.style.height = 'auto';
                    
                    // Scroll suave hacia el formulario
                    setTimeout(() => {
                        fs.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
                
                // Actualizar botones
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                if (btn) btn.classList.add('active');
                
                // Limpiar formulario al hacer click en "Nuevo material"
                const form = document.getElementById('materialForm');
                if (form) {
                    form.reset();
                    console.log('🧹 Formulario limpiado');
                }
                
                // También llamar a showSection si está disponible
                if (typeof window.showSection === 'function') {
                    window.showSection('form');
                }
                
                console.log('✅ Formulario mostrado y limpiado');
            } else if (target.id === 'btnCategoria') {
                console.log('✅ Botón Categoría clickeado (material.js)');
                e.preventDefault();
                e.stopPropagation();
                // Actualizar botones activos
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                // Abrir modal de categoría
                if (modalCategoria) {
                    modalCategoria.style.display = "flex";
                }
            } else if (target.id === 'btnNombreMaterial') {
                console.log('✅ Botón Nombre Material clickeado (material.js)');
                e.preventDefault();
                e.stopPropagation();
                // Actualizar botones activos
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                // Abrir modal de nombre de material
                if (modalNombreMaterial) {
                    modalNombreMaterial.style.display = "flex";
                }
            } else if (target.id === 'btnEditar') {
                console.log('✅ Botón Editar clickeado (material.js)');
                e.preventDefault();
                e.stopPropagation();
                // Actualizar botones activos
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                // Abrir modal de edición
                mostrarModalEditar();
            }
        }, true); // Usar capture phase para ejecutar antes que otros listeners
    } else {
        console.warn('⚠️ tabsContainer no encontrado, usando listeners directos');
        // Fallback: listeners directos
        if (btnNuevoMaterial) {
            console.log('✅ Agregando listener directo a btnNuevoMaterial');
            btnNuevoMaterial.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ Botón Nuevo Material clickeado (fallback - material.js)');
                if (typeof window.showSection === 'function') {
                    window.showSection('form');
                } else {
                    console.error('❌ window.showSection no disponible en fallback');
                    // Fallback manual
                    const fs = document.getElementById('formSection');
                    if (fs) fs.style.display = 'block';
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    if (btnNuevoMaterial) btnNuevoMaterial.classList.add('active');
                }
            }, true);
        } else {
            console.error('❌ btnNuevoMaterial no encontrado para listener directo');
        }
        
    }

    /**
     * Actualizar el dropdown personalizado después de modificar las opciones del select
     */
    function updateCustomDropdown(select) {
        if (!select) return;
        
        // Buscar el wrapper personalizado
        const wrapper = select.closest('.menu-desplegable-wrapper');
        if (!wrapper) {
            // Si no hay wrapper, intentar inicializar el dropdown personalizado
            if (typeof initCustomDropdowns === 'function') {
                initCustomDropdowns();
            }
            return;
        }
        
        // Buscar el trigger y el optionsContainer
        const trigger = wrapper.querySelector('.menu-desplegable-trigger');
        
        // Buscar el optionsContainer usando el atributo data-optionsContainerId del wrapper
        let optionsContainer = null;
        if (wrapper.dataset.optionsContainerId) {
            optionsContainer = document.getElementById(wrapper.dataset.optionsContainerId);
        }
        
        // Si no se encuentra por ID, intentar buscar por data-select-id
        if (!optionsContainer && select.id) {
            optionsContainer = document.querySelector(`.menu-desplegable-options[data-select-id="${select.id}"]`);
        }
        
        // Si aún no se encuentra, buscar en todos los contenedores
        if (!optionsContainer) {
            const allContainers = document.querySelectorAll('.menu-desplegable-options');
            for (const container of allContainers) {
                const firstOption = container.querySelector('.menu-desplegable-option');
                if (firstOption) {
                    const firstOptionValue = firstOption.dataset.value;
                    // Verificar si la primera opción coincide con alguna opción del select
                    const matchingOption = Array.from(select.options).find(opt => opt.value === firstOptionValue);
                    if (matchingOption) {
                        optionsContainer = container;
                        // Vincular el contenedor al select para futuras búsquedas
                        if (select.id) {
                            container.dataset.selectId = select.id;
                        }
                        if (!wrapper.dataset.optionsContainerId && container.id) {
                            wrapper.dataset.optionsContainerId = container.id;
                        }
                        break;
                    }
                }
            }
        }
        
        // Si encontramos el trigger y el container, actualizarlos
        if (trigger && optionsContainer) {
            // Preservar el campo de búsqueda si existe
            const searchInput = optionsContainer.querySelector('.menu-desplegable-search');
            const searchValue = searchInput ? searchInput.value : '';
            
            // Actualizar el texto del trigger con la opción seleccionada
            const selectedOption = select.options[select.selectedIndex];
            const defaultText = select.id === 'categoria' ? 'Seleccione una categoría' : (select.id === 'nombre-material' ? 'Seleccione un nombre de material' : 'Seleccione una opción');
            trigger.textContent = selectedOption ? selectedOption.text : defaultText;
            
            // Limpiar opciones anteriores (preservar el campo de búsqueda)
            const existingOptions = Array.from(optionsContainer.children).filter(child => child !== searchInput);
            existingOptions.forEach(child => child.remove());
            
            // Obtener referencia al campo de búsqueda actual (si existe)
            let currentSearchInput = optionsContainer.querySelector('.menu-desplegable-search');
            
            // Si no existe el campo de búsqueda pero el select tiene data-searchable, crearlo
            if (!currentSearchInput && select.hasAttribute('data-searchable')) {
                currentSearchInput = document.createElement('input');
                currentSearchInput.type = 'text';
                currentSearchInput.className = 'menu-desplegable-search';
                currentSearchInput.placeholder = 'Buscar...';
                currentSearchInput.style.cssText = 'width: 100%; padding: 8px; border: none; border-bottom: 1px solid #ddd; outline: none; box-sizing: border-box;';
                optionsContainer.insertBefore(currentSearchInput, optionsContainer.firstChild);
            }
            
            // Función para renderizar opciones con filtro
            const renderOptionsWithFilter = (filterTerm = '') => {
                const filterLower = filterTerm.toLowerCase().trim();
                // Limpiar solo las opciones, preservar el campo de búsqueda
                const allChildren = Array.from(optionsContainer.children);
                allChildren.forEach(child => {
                    if (!child.classList.contains('menu-desplegable-search')) {
                        child.remove();
                    }
                });
                
                Array.from(select.options).forEach((option, index) => {
                    // Filtrar opciones si hay término de búsqueda
                    if (filterTerm && !option.text.toLowerCase().includes(filterLower)) {
                        return;
                    }
                    
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'menu-desplegable-option';
                    optionDiv.textContent = option.text;
                    optionDiv.dataset.value = option.value;
                    
                    if (option.selected || index === select.selectedIndex) {
                        optionDiv.classList.add('selected');
                    }
                    
                    optionDiv.addEventListener('click', () => {
                        // Actualizar el select nativo
                        select.selectedIndex = index;
                        select.value = option.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        // Actualizar visualmente
                        optionsContainer.querySelectorAll('.menu-desplegable-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        optionDiv.classList.add('selected');
                        
                        trigger.textContent = option.text;
                        
                        // Cerrar el dropdown
                        trigger.classList.remove('active');
                        optionsContainer.classList.remove('active');
                        
                        // Limpiar campo de búsqueda cuando se selecciona una opción
                        const searchField = optionsContainer.querySelector('.menu-desplegable-search');
                        if (searchField) {
                            searchField.value = '';
                        }
                    });
                    
                    // Insertar después del campo de búsqueda si existe
                    if (currentSearchInput && currentSearchInput.parentNode === optionsContainer) {
                        const nextSibling = currentSearchInput.nextSibling;
                        if (nextSibling) {
                            optionsContainer.insertBefore(optionDiv, nextSibling);
                        } else {
                            optionsContainer.appendChild(optionDiv);
                        }
                    } else {
                        optionsContainer.appendChild(optionDiv);
                    }
                });
            };
            
            // Renderizar opciones iniciales
            renderOptionsWithFilter(currentSearchInput ? currentSearchInput.value : '');
            
            // Si hay campo de búsqueda, actualizar su listener
            if (currentSearchInput) {
                // Remover listeners anteriores clonando el input
                const newSearchInput = currentSearchInput.cloneNode(true);
                currentSearchInput.parentNode.replaceChild(newSearchInput, currentSearchInput);
                
                newSearchInput.addEventListener('input', (e) => {
                    renderOptionsWithFilter(e.target.value);
                });
                
                newSearchInput.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
            
            console.log(`✅ Dropdown personalizado actualizado con ${select.options.length} opciones`);
        } else {
            // Si no encontramos los elementos, reinicializar completamente
            console.log('⚠️ Elementos del dropdown personalizado no encontrados, reinicializando...');
            if (wrapper && wrapper.parentElement) {
                // Remover el wrapper existente
                const parent = wrapper.parentElement;
                parent.insertBefore(select, wrapper);
                parent.removeChild(wrapper);
                if (optionsContainer) {
                    optionsContainer.remove();
                }
                select.dataset.customized = 'false';
                
                // Reinicializar
                if (typeof initCustomDropdowns === 'function') {
                    setTimeout(() => {
                        initCustomDropdowns();
                    }, 100);
                }
            }
        }
    }

    /**
     * Cargar categorías desde la API
     */
    async function cargarCategorias() {
        console.log('🔄 Iniciando carga de categorías...');
        try {
            if (typeof window.API !== 'undefined') {
                const response = await window.API.CategoriaMaterial.getAll();
                console.log('📡 Respuesta de API:', response);
                if (response && response.success) {
                    categoriasList = response.data || [];
                    console.log(`✅ ${categoriasList.length} categorías cargadas desde la base de datos:`, categoriasList);
                } else {
                    console.warn('⚠️ No se pudieron cargar categorías:', response?.message);
                    categoriasList = [];
                }
            } else {
                console.warn('⚠️ API no disponible');
                categoriasList = [];
            }
        } catch (error) {
            console.error('❌ Error al cargar categorías:', error);
            categoriasList = [];
        }
        
        const selectCategoria = document.getElementById('categoria');
        const selectEditCategoria = document.getElementById('edit-categoria');
        
        // Limpiar y poblar select de categorías - Solo mostrar categorías de la base de datos
        if (selectCategoria) {
            console.log('🔄 Actualizando dropdown de categorías...');
            // Guardar valor seleccionado actual (si existe)
            const valorSeleccionado = selectCategoria.value;
            
            // Limpiar todas las opciones
            selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            
            // Agregar categorías de la base de datos
            if (categoriasList && categoriasList.length > 0) {
                categoriasList.forEach((cat, index) => {
                    const option = document.createElement('option');
                    const categoriaId = cat.idCategoria || cat.nombre;
                    const categoriaNombre = cat.nombre || cat.nombreCategoria || '';
                    option.value = categoriaId;
                    option.textContent = categoriaNombre;
                    selectCategoria.appendChild(option);
                    console.log(`  ✓ Agregada opción ${index + 1}: ${categoriaNombre} (ID: ${categoriaId})`);
                });
                console.log(`✅ ${categoriasList.length} categorías cargadas en el dropdown "Categoría de material"`);
                
                // Intentar restaurar el valor seleccionado si existe en las nuevas opciones
                if (valorSeleccionado) {
                    const existeOpcion = Array.from(selectCategoria.options).some(opt => opt.value === valorSeleccionado);
                    if (existeOpcion) {
                        selectCategoria.value = valorSeleccionado;
                    }
                }
            } else {
                console.warn('⚠️ No hay categorías disponibles. Agrega una categoría primero.');
            }
            
            // Disparar evento change para notificar a otros listeners
            selectCategoria.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Actualizar el dropdown personalizado si existe
            updateCustomDropdown(selectCategoria);
            
            console.log('✅ Dropdown de categorías actualizado completamente');
        } else {
            console.error('❌ No se encontró el elemento selectCategoria');
        }
        
        // Actualizar también el select de editar material
        if (selectEditCategoria) {
            // Limpiar todas las opciones
            selectEditCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            
            // Agregar categorías de la base de datos
            if (categoriasList && categoriasList.length > 0) {
                categoriasList.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.idCategoria || cat.nombre;
                    option.textContent = cat.nombre || cat.nombreCategoria || '';
                    selectEditCategoria.appendChild(option);
                });
            }
        }
    }

    /**
     * Guardar categoría en el backend
     */
    const formCategoria = document.getElementById('formCategoria');
    if (formCategoria && !formCategoria.dataset.listenerAdded) {
        formCategoria.dataset.listenerAdded = 'true';
        
        formCategoria.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const nombreCategoria = document.getElementById('nombre-categoria').value.trim();
            
            if (!nombreCategoria) {
                if (window.showError) {
                    window.showError('Por favor ingrese un nombre para la categoría');
                } else {
                    alert('Por favor ingrese un nombre para la categoría');
                }
                return false;
            }
            
            try {
                if (typeof window.API !== 'undefined') {
                    console.log('💾 Guardando categoría en base de datos:', nombreCategoria);
                    
                    // Verificar credenciales antes de hacer la petición
                    const username = localStorage.getItem('username');
                    const password = localStorage.getItem('password');
                    
                    if (!username || !password) {
                        if (typeof showError === 'function') {
                            showError('No hay credenciales almacenadas. Por favor, inicia sesión.');
                        } else {
                            alert('No hay credenciales almacenadas. Por favor, inicia sesión.');
                        }
                        // NO redirigir automáticamente - dejar que el usuario decida
                        return false;
                    }
                    
                    // Crear categoría en el backend
                    const response = await window.API.CategoriaMaterial.create({ nombre: nombreCategoria });
                    
                    console.log('📡 Respuesta del servidor:', response);
                    
                    if (response && response.success === true && response.data) {
                        console.log('✅ Categoría guardada exitosamente:', response.data);
                        
                        // Esperar un poco para asegurar que la base de datos se actualizó
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        // Recargar categorías desde la base de datos
                        await cargarCategorias();
                        
                        // Verificar que el dropdown se actualizó
                        const selectCategoria = document.getElementById('categoria');
                        if (selectCategoria) {
                            console.log('📋 Dropdown actualizado. Opciones disponibles:', selectCategoria.options.length);
                            
                            // Seleccionar la categoría recién guardada
                            if (response.data.idCategoria) {
                                selectCategoria.value = response.data.idCategoria;
                                console.log('✅ Categoría seleccionada en el dropdown (por ID):', response.data.nombre);
                            } else if (response.data.nombre) {
                                // Buscar por nombre como fallback
                                const options = Array.from(selectCategoria.options);
                                const newOption = options.find(opt => opt.textContent.trim() === response.data.nombre.trim());
                                if (newOption) {
                                    selectCategoria.value = newOption.value;
                                    console.log('✅ Categoría seleccionada en el dropdown (por nombre):', response.data.nombre);
                                } else {
                                    console.warn('⚠️ No se pudo encontrar la categoría en el dropdown:', response.data.nombre);
                                }
                            }
                            
                            // Forzar evento change para notificar actualización
                            selectCategoria.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        // Limpiar formulario
                        document.getElementById('nombre-categoria').value = '';
                        
                        // Cerrar modal
                        cerrarModalCategoria();
                        
                        // Mostrar mensaje de éxito
                        if (typeof showSuccess === 'function') {
                            showSuccess('Categoría guardada correctamente. Ya está disponible en el dropdown.');
                        } else {
                            alert('Categoría guardada correctamente');
                        }
                    } else {
                        // La respuesta tiene success: false
                        const errorMessage = response?.message || 'Error al guardar la categoría';
                        console.error('❌ Error al guardar categoría:', errorMessage, response);
                        throw new Error(errorMessage);
                    }
                } else {
                    // Fallback a localStorage (solo si API no está disponible)
                    console.warn('⚠️ API no disponible, usando localStorage');
                    const categorias = JSON.parse(localStorage.getItem('categorias_materiales') || '[]');
                    if (categorias.includes(nombreCategoria)) {
                        if (typeof showWarning === 'function') {
                            showWarning('Esta categoría ya existe');
                        } else {
                            alert('Esta categoría ya existe');
                        }
                        return false;
                    }
                    categorias.push(nombreCategoria);
                    localStorage.setItem('categorias_materiales', JSON.stringify(categorias));
                    await cargarCategorias();
                    
                    document.getElementById('nombre-categoria').value = '';
                    cerrarModalCategoria();
                    
                    if (typeof showSuccess === 'function') {
                        showSuccess('Categoría guardada correctamente');
                    } else {
                        alert('Categoría guardada correctamente');
                    }
                }
            } catch (error) {
                console.error('❌ Error al guardar categoría:', error);
                
                // Si es error de autenticación (401), limpiar credenciales pero dar opción al usuario
                if (error.status === 401 || (error.message && error.message.includes('Sesión expirada'))) {
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                    if (typeof showError === 'function') {
                        showError('Tu sesión ha expirado. Serás redirigido al login en 2 segundos.');
                    } else {
                        alert('Tu sesión ha expirado. Serás redirigido al login.');
                    }
                    // Dar un momento antes de redirigir para que el usuario vea el mensaje
                    setTimeout(() => {
                        window.location.href = 'Index.html';
                    }, 2000);
                } else {
                    // Para otros errores, solo mostrar el mensaje sin cerrar sesión
                    if (typeof showError === 'function') {
                        showError(error.message || 'Error al guardar la categoría');
                    } else {
                        alert('Error al guardar la categoría: ' + (error.message || 'Error desconocido'));
                    }
                }
            }
            
            return false;
        });
    }

    // Modal Agregar Categoría
    btnCategoria.addEventListener("click", () => {
        modalCategoria.style.display = "flex";
    });

    const cerrarModalCategoria = () => {
        modalCategoria.style.display = "none";
    };
    
    if (closeCategoria && !closeCategoria.dataset.listenerAdded) {
        closeCategoria.dataset.listenerAdded = 'true';
        closeCategoria.addEventListener("click", cerrarModalCategoria);
    }

    /**
     * Cargar nombres de materiales desde la API
     */
    async function cargarNombresMaterial() {
        console.log('🔄 Iniciando carga de nombres de materiales...');
        try {
            if (typeof window.API !== 'undefined' && window.API.NombreMaterial) {
                const response = await window.API.NombreMaterial.getAll();
                console.log('📡 Respuesta de API nombres:', response);
                if (response && response.success) {
                    nombresMaterialList = response.data || [];
                    console.log(`✅ ${nombresMaterialList.length} nombres de materiales cargados desde la base de datos:`, nombresMaterialList);
                } else {
                    console.warn('⚠️ No se pudieron cargar nombres de materiales:', response?.message);
                    nombresMaterialList = [];
                }
            } else {
                console.warn('⚠️ API NombreMaterial no disponible');
                nombresMaterialList = [];
            }
        } catch (error) {
            console.error('❌ Error al cargar nombres de materiales:', error);
            nombresMaterialList = [];
        }
        
        const selectNombreMaterial = document.getElementById('nombre-material');
        
        // Limpiar y poblar select de nombres de materiales
        if (selectNombreMaterial) {
            console.log('🔄 Actualizando dropdown de nombres de materiales...');
            const valorSeleccionado = selectNombreMaterial.value;
            
            selectNombreMaterial.innerHTML = '<option value="">Seleccione un nombre de material</option>';
            
            if (nombresMaterialList && nombresMaterialList.length > 0) {
                nombresMaterialList.forEach((nom, index) => {
                    const option = document.createElement('option');
                    const nombreId = nom.idNombreMaterial || nom.nombre;
                    const nombreNombre = nom.nombre || '';
                    option.value = nombreNombre; // Usar el nombre como valor
                    option.textContent = nombreNombre;
                    option.dataset.id = nombreId; // Guardar el ID en un atributo
                    selectNombreMaterial.appendChild(option);
                    console.log(`  ✓ Agregada opción ${index + 1}: ${nombreNombre} (ID: ${nombreId})`);
                });
                console.log(`✅ ${nombresMaterialList.length} nombres de materiales cargados en el dropdown`);
                
                if (valorSeleccionado) {
                    const existeOpcion = Array.from(selectNombreMaterial.options).some(opt => opt.value === valorSeleccionado);
                    if (existeOpcion) {
                        selectNombreMaterial.value = valorSeleccionado;
                    }
                }
            } else {
                console.warn('⚠️ No hay nombres de materiales disponibles. Agrega un nombre de material primero.');
            }
            
            selectNombreMaterial.dispatchEvent(new Event('change', { bubbles: true }));
            updateCustomDropdown(selectNombreMaterial);
            console.log('✅ Dropdown de nombres de materiales actualizado completamente');
        }
    }

    /**
     * Guardar nombre de material en el backend
     */
    const formNombreMaterial = document.getElementById('formNombreMaterial');
    if (formNombreMaterial && !formNombreMaterial.dataset.listenerAdded) {
        formNombreMaterial.dataset.listenerAdded = 'true';
        
        formNombreMaterial.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const nombreNombreMaterial = document.getElementById('nombre-nombre-material').value.trim();
            
            if (!nombreNombreMaterial) {
                if (window.showError) {
                    window.showError('Por favor ingrese un nombre para el material');
                } else {
                    alert('Por favor ingrese un nombre para el material');
                }
                return false;
            }
            
            try {
                if (typeof window.API !== 'undefined' && window.API.NombreMaterial) {
                    console.log('💾 Guardando nombre de material en base de datos:', nombreNombreMaterial);
                    
                    const username = localStorage.getItem('username');
                    const password = localStorage.getItem('password');
                    
                    if (!username || !password) {
                        if (typeof showError === 'function') {
                            showError('No hay credenciales almacenadas. Por favor, inicia sesión.');
                        } else {
                            alert('No hay credenciales almacenadas. Por favor, inicia sesión.');
                        }
                        return false;
                    }
                    
                    const response = await window.API.NombreMaterial.create({ nombre: nombreNombreMaterial });
                    
                    console.log('📡 Respuesta del servidor:', response);
                    
                    if (response && response.success === true && response.data) {
                        console.log('✅ Nombre de material guardado exitosamente:', response.data);
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        await cargarNombresMaterial();
                        
                        const selectNombreMaterial = document.getElementById('nombre-material');
                        if (selectNombreMaterial && response.data.nombre) {
                            selectNombreMaterial.value = response.data.nombre;
                            selectNombreMaterial.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        document.getElementById('nombre-nombre-material').value = '';
                        cerrarModalNombreMaterial();
                        
                        if (typeof showSuccess === 'function') {
                            showSuccess('Nombre de material guardado correctamente. Ya está disponible en el dropdown.');
                        } else {
                            alert('Nombre de material guardado correctamente');
                        }
                    } else {
                        const errorMessage = response?.message || 'Error al guardar el nombre de material';
                        console.error('❌ Error al guardar nombre de material:', errorMessage, response);
                        throw new Error(errorMessage);
                    }
                }
            } catch (error) {
                console.error('❌ Error al guardar nombre de material:', error);
                if (error.status === 401 || (error.message && error.message.includes('Sesión expirada'))) {
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                    if (typeof showError === 'function') {
                        showError('Tu sesión ha expirado. Serás redirigido al login en 2 segundos.');
                    } else {
                        alert('Tu sesión ha expirado. Serás redirigido al login.');
                    }
                    setTimeout(() => {
                        window.location.href = 'Index.html';
                    }, 2000);
                } else {
                    if (typeof showError === 'function') {
                        showError(error.message || 'Error al guardar el nombre de material');
                    } else {
                        alert('Error al guardar el nombre de material: ' + (error.message || 'Error desconocido'));
                    }
                }
            }
            
            return false;
        });
    }

    // Modal Agregar Nombre de Material
    if (btnNombreMaterial) {
        btnNombreMaterial.addEventListener("click", () => {
            if (modalNombreMaterial) {
                modalNombreMaterial.style.display = "flex";
            }
        });
    }

    const cerrarModalNombreMaterial = () => {
        if (modalNombreMaterial) {
            modalNombreMaterial.style.display = "none";
        }
    };
    
    if (closeNombreMaterial && !closeNombreMaterial.dataset.listenerAdded) {
        closeNombreMaterial.dataset.listenerAdded = 'true';
        closeNombreMaterial.addEventListener("click", cerrarModalNombreMaterial);
    }

    /**
     * Cargar materiales desde la API
     */
    async function cargarMateriales() {
        try {
            if (typeof window.API !== 'undefined') {
                const response = await window.API.Material.getAll();
                if (response.success) {
                    materialesList = response.data || [];
                    console.log('✅ Materiales cargados desde API:', materialesList.length);
                } else {
                    console.warn('⚠️ No se pudieron cargar materiales:', response.message);
                    materialesList = [];
                }
            } else {
                materialesList = [];
            }
        } catch (error) {
            console.error('❌ Error al cargar materiales:', error);
            // Si es error de autenticación, continuar con lista vacía
            if (error.message && error.message.includes('credenciales')) {
                console.warn('⚠️ No hay credenciales. Los materiales se cargarán después del login.');
            }
            materialesList = [];
        }
    }

    /**
     * Cargar inventario desde la API
     */
    async function cargarInventario() {
        const tbody = document.querySelector('.inventory-table tbody');
        if (!tbody) return;
        
        try {
            // Cargar materiales primero
            await cargarMateriales();
            
            // Obtener inventario (stock) desde la API
            let inventario = [];
            if (typeof window.API !== 'undefined') {
                try {
                    const response = await fetch('http://localhost:8080/api/inventario', {
                        headers: window.API && typeof window.getAuthHeaders === 'function' 
                            ? window.getAuthHeaders() 
                            : { 'Content-Type': 'application/json' },
                        credentials: 'omit'
                    });
                    if (response.ok) {
                        inventario = await response.json();
                    }
                } catch (error) {
                    console.warn('⚠️ No se pudo cargar inventario:', error);
                }
            }
            
            tbody.innerHTML = '';
            
            if (materialesList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">No hay materiales registrados</td></tr>';
                return;
            }
            
            materialesList.forEach(material => {
                // Buscar stock en el inventario
                const stockItem = inventario.find(inv => inv.material?.idMaterial === material.idMaterial);
                const stock = stockItem ? parseFloat(stockItem.cantidadTotal || 0) : 0;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${material.idMaterial}</td>
                    <td>${material.nombre}</td>
                    <td>${material.categoria?.nombre || 'Sin categoría'}</td>
                    <td>${stock.toFixed(2)} Kg</td>
                    <td>
                        <button class="action-btn edit" data-material-id="${material.idMaterial}">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" data-material-id="${material.idMaterial}">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                            </svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('❌ Error al cargar inventario:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #f00;">Error al cargar inventario</td></tr>';
        }
    }

    // Función para editar material
    function editarMaterial(btn) {
        const materialId = parseInt(btn.getAttribute('data-material-id'));
        currentEditMaterial = materialesList.find(m => m.idMaterial === materialId);
        
        if (!currentEditMaterial) return;
        
        // Rellenar el formulario de edición
        document.getElementById('edit-codigo').value = currentEditMaterial.idMaterial;
        document.getElementById('edit-descripcion').value = currentEditMaterial.nombre;
        
        // Seleccionar la categoría correcta
        const categoriaId = currentEditMaterial.categoria?.idCategoria;
        const selectEditCategoria = document.getElementById('edit-categoria');
        if (selectEditCategoria && categoriaId) {
            selectEditCategoria.value = categoriaId;
        }
        
        // Mostrar el modal
        modalEditarMaterial.style.display = "flex";
    }

    // Función para eliminar material
    async function eliminarMaterial(btn) {
        const materialId = parseInt(btn.getAttribute('data-material-id'));
        const material = materialesList.find(m => m.idMaterial === materialId);
        
        if (!material) return;
        
        let confirmar = false;
        if (window.confirm && typeof window.confirm === 'function') {
            try {
                confirmar = await window.confirm('¿Está seguro de que desea eliminar este material?');
            } catch (e) {
                confirmar = confirm('¿Está seguro de que desea eliminar este material?');
            }
        } else {
            confirmar = confirm('¿Está seguro de que desea eliminar este material?');
        }
        
        if (!confirmar) return;
        
        try {
            if (typeof window.API !== 'undefined') {
                await window.API.Material.delete(materialId);
                // Recargar materiales e inventario
                await cargarMateriales();
                await cargarInventario();
                showSuccess('Material eliminado correctamente');
            }
        } catch (error) {
            console.error('❌ Error al eliminar material:', error);
            showError(error.message || 'Error al eliminar el material');
        }
    }

    // Guardar cambios del material editado
    const formEditarMaterial = document.getElementById('formEditarMaterial');
    if (formEditarMaterial) {
        formEditarMaterial.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentEditMaterial) return;
            
            const editNombreMaterialField = document.getElementById('edit-nombre-material');
            const editDescripcionField = document.getElementById('edit-descripcion');
            const nombre = editNombreMaterialField ? editNombreMaterialField.value.trim() : (editDescripcionField ? editDescripcionField.value.trim() : '');
            const categoriaId = document.getElementById('edit-categoria').value;
            
            if (!nombre) {
                showError('Por favor ingrese el nombre del material');
                return;
            }
            
            if (!categoriaId) {
                showError('Por favor seleccione una categoría');
                return;
            }
            
            try {
                if (typeof window.API !== 'undefined') {
                    const categoria = categoriasList.find(c => (c.idCategoria || c.nombre) == categoriaId);
                    
                    const materialActualizado = {
                        nombre: nombre,
                        categoria: { idCategoria: categoria?.idCategoria || categoriaId }
                    };
                    
                    await window.API.Material.update(currentEditMaterial.idMaterial, materialActualizado);
                    
                    // Recargar materiales e inventario
                    await cargarMateriales();
                    await cargarInventario();
                    
                    modalEditarMaterial.style.display = "none";
                    currentEditMaterial = null;
                    
                    showSuccess('Material actualizado correctamente');
                }
            } catch (error) {
                console.error('❌ Error al actualizar material:', error);
                showError(error.message || 'Error al actualizar el material');
            }
        });
    }

    // Guardar nuevo material
    const materialForm = document.getElementById('materialForm');
    if (materialForm) {
        materialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const codigo = document.getElementById('codigo').value.trim();
            const nombreMaterialSelect = document.getElementById('nombre-material');
            const nombre = nombreMaterialSelect ? nombreMaterialSelect.options[nombreMaterialSelect.selectedIndex]?.text : '';
            const nombreMaterialId = nombreMaterialSelect ? nombreMaterialSelect.value : '';
            const categoriaId = document.getElementById('categoria').value;
            const precioUnidad = parseFloat(document.getElementById('precio-unidad').value) || 0;
            const precioVenta = parseFloat(document.getElementById('precio-venta').value) || 0;
            
            if (!nombreMaterialId) {
                showError('Por favor seleccione un nombre de material');
                return;
            }
            
            if (!categoriaId) {
                showError('Por favor seleccione una categoría');
                return;
            }
            
            try {
                if (typeof window.API !== 'undefined') {
                    const categoria = categoriasList.find(c => (c.idCategoria || c.nombre) == categoriaId);
                    
                    const nuevoMaterial = {
                        nombre: nombre,
                        categoria: { idCategoria: categoria?.idCategoria || categoriaId }
                    };
                    
                    const response = await window.API.Material.create(nuevoMaterial);
                    
                    if (response.success || response.idMaterial) {
                        // Guardar información de precio en inventario (localStorage) para referencia
                        const idMaterialCreado = response.idMaterial || response.data?.idMaterial || null;
                        
                        // Buscar si ya existe un item con este material en el inventario
                        let inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
                        let itemExistente = inventario.find(item => item.idMaterial === idMaterialCreado);
                        
                        if (itemExistente) {
                            // Actualizar precio si el material ya existe
                            itemExistente.precioUnidad = precioUnidad;
                            itemExistente.precioVenta = precioVenta;
                            if (codigo) itemExistente.codigo = codigo;
                        } else {
                            // Crear nuevo item solo con información de precio (no cantidad)
                            const inventarioItem = {
                                id: Date.now(),
                                idMaterial: idMaterialCreado,
                                codigo: codigo || '',
                                nombreMaterial: nombre,
                                categoria: categoria?.nombre || 'Sin categoría',
                                precioUnidad: precioUnidad,
                                precioVenta: precioVenta,
                                cantidad: 0, // La cantidad se maneja en compras/ventas
                                fechaCreacion: new Date().toISOString()
                            };
                            inventario.push(inventarioItem);
                        }
                        
                        // Guardar en localStorage
                        localStorage.setItem('inventario_materiales', JSON.stringify(inventario));
                        
                        // Recargar materiales e inventario
                        await cargarMateriales();
                        await cargarInventario();
                        
                        // Limpiar formulario
                        materialForm.reset();
                        
                        showSuccess('Material agregado correctamente');
                    } else {
                        showError(response.message || 'Error al crear el material');
                    }
                } else {
                    // Fallback a localStorage (por compatibilidad)
                    const inventarioItem = {
                        id: Date.now(),
                        codigo: codigo || '',
                        descripcion: nombre,
                        categoria: 'Sin categoría',
                        precioUnidad: precioUnidad,
                        precioVenta: precioVenta,
                        fechaCreacion: new Date().toISOString()
                    };
                    
                    let inventario = JSON.parse(localStorage.getItem('inventario_materiales') || '[]');
                    inventario.push(inventarioItem);
                    localStorage.setItem('inventario_materiales', JSON.stringify(inventario));
                    
                    materialForm.reset();
                    showSuccess('Material agregado correctamente');
                }
            } catch (error) {
                console.error('❌ Error al crear material:', error);
                showError(error.message || 'Error al crear el material');
            }
        });
    }
    
    // Conectar botones de acción (soporta clicks sobre SVGs)
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest && e.target.closest('.action-btn.edit');
        if (editBtn) {
            editarMaterial(editBtn);
            return;
        }
        const delBtn = e.target.closest && e.target.closest('.action-btn.delete');
        if (delBtn) {
            eliminarMaterial(delBtn);
            return;
        }
    });

    // Modal Editar Material
    closeEditarMaterial.addEventListener("click", () => {
        modalEditarMaterial.style.display = "none";
        currentEditMaterial = null;
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener("click", (e) => {
        if (e.target === modalCategoria) {
            modalCategoria.style.display = "none";
        }
        if (modalNombreMaterial && e.target === modalNombreMaterial) {
            modalNombreMaterial.style.display = "none";
        }
        if (e.target === modalEditarMaterial) {
            modalEditarMaterial.style.display = "none";
            currentEditMaterial = null;
        }
    });

    // Cargar categorías y materiales al inicializar (solo si hay credenciales)
    try {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        
        if (username && password) {
            await cargarCategorias();
            await cargarNombresMaterial();
            await cargarMateriales();
        } else {
            console.warn('⚠️ No hay credenciales. Los datos se cargarán después del login.');
            categoriasList = [];
            materialesList = [];
        }
    } catch (error) {
        console.error('❌ Error al verificar credenciales:', error);
        categoriasList = [];
        materialesList = [];
    }

    // Mostrar formulario por defecto cuando se carga la página y marcar botón como activo
    if (formSection && btnNuevoMaterial) {
        formSection.style.display = 'block';
        formSection.style.visibility = 'visible';
        formSection.style.opacity = '1';
        btnNuevoMaterial.classList.add('active');
    }
    
    /**
     * Mostrar modal de edición de categorías y nombres de materiales
     */
    async function mostrarModalEditar() {
        const modal = document.getElementById('modalEditarCategoriasNombres');
        if (!modal) {
            // Cargar el modal si no está disponible
            if (typeof window.cargarModalMaterial === 'function') {
                await window.cargarModalMaterial('modalEditarCategoriasNombres');
                // Esperar un poco para que el modal se cargue
                await new Promise(resolve => setTimeout(resolve, 200));
                mostrarModalEditar();
                return;
            } else {
                console.error('Modal de edición no encontrado');
                return;
            }
        }
        
        // Cargar listas actualizadas
        await cargarCategorias();
        await cargarNombresMaterial();
        
        // Renderizar listas en el modal
        renderizarListaCategorias();
        renderizarListaNombresMaterial();
        
        // Agregar listeners a los buscadores
        const buscadorCategorias = document.getElementById('buscador-categorias-editar');
        const buscadorNombres = document.getElementById('buscador-nombres-editar');
        
        if (buscadorCategorias) {
            buscadorCategorias.addEventListener('input', (e) => {
                renderizarListaCategorias(e.target.value);
            });
        }
        
        if (buscadorNombres) {
            buscadorNombres.addEventListener('input', (e) => {
                renderizarListaNombresMaterial(e.target.value);
            });
        }
        
        modal.style.display = 'flex';
    }
    
    /**
     * Renderizar lista de categorías para edición
     */
    function renderizarListaCategorias(filtro = '') {
        const container = document.getElementById('lista-categorias-editar');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Filtrar categorías
        const categoriasFiltradas = categoriasList.filter(cat => {
            if (!filtro) return true;
            const nombre = (cat.nombre || '').toLowerCase();
            return nombre.includes(filtro.toLowerCase());
        });
        
        if (categoriasFiltradas.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">' + (filtro ? 'No se encontraron categorías' : 'No hay categorías disponibles') + '</p>';
            return;
        }
        
        categoriasFiltradas.forEach(cat => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = cat.nombre || '';
            input.dataset.id = cat.idCategoria;
            input.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;';
            
            const btnGuardar = document.createElement('button');
            btnGuardar.textContent = 'Guardar';
            btnGuardar.className = 'btn btn-save';
            btnGuardar.style.cssText = 'padding: 8px 15px; background: #2d5a47; color: white; border: none; border-radius: 4px; cursor: pointer;';
            btnGuardar.onclick = async () => {
                const nuevoNombre = input.value.trim();
                if (!nuevoNombre) {
                    mostrarErrorEditar('El nombre no puede estar vacío');
                    return;
                }
                
                try {
                    const response = await window.API.CategoriaMaterial.update(cat.idCategoria, { nombre: nuevoNombre });
                    if (response.success) {
                        mostrarSuccessEditar('Categoría actualizada correctamente');
                        await cargarCategorias();
                        // Mantener el filtro del buscador
                        const buscadorCategorias = document.getElementById('buscador-categorias-editar');
                        const filtroActual = buscadorCategorias ? buscadorCategorias.value : '';
                        renderizarListaCategorias(filtroActual);
                        // Actualizar dropdown si está visible
                        const selectCategoria = document.getElementById('categoria');
                        if (selectCategoria) {
                            updateCustomDropdown(selectCategoria);
                        }
                    } else {
                        mostrarErrorEditar(response.message || 'Error al actualizar categoría');
                    }
                } catch (error) {
                    mostrarErrorEditar(error.message || 'Error al actualizar categoría');
                }
            };
            
            itemDiv.appendChild(input);
            itemDiv.appendChild(btnGuardar);
            container.appendChild(itemDiv);
        });
    }
    
    /**
     * Renderizar lista de nombres de materiales para edición
     */
    function renderizarListaNombresMaterial(filtro = '') {
        const container = document.getElementById('lista-nombres-materiales-editar');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Filtrar nombres de materiales
        const nombresFiltrados = nombresMaterialList.filter(nom => {
            if (!filtro) return true;
            const nombre = (nom.nombre || '').toLowerCase();
            return nombre.includes(filtro.toLowerCase());
        });
        
        if (nombresFiltrados.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 10px;">' + (filtro ? 'No se encontraron nombres de materiales' : 'No hay nombres de materiales disponibles') + '</p>';
            return;
        }
        
        nombresFiltrados.forEach(nom => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = nom.nombre || '';
            input.dataset.id = nom.idNombreMaterial;
            input.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;';
            
            const btnGuardar = document.createElement('button');
            btnGuardar.textContent = 'Guardar';
            btnGuardar.className = 'btn btn-save';
            btnGuardar.style.cssText = 'padding: 8px 15px; background: #2d5a47; color: white; border: none; border-radius: 4px; cursor: pointer;';
            btnGuardar.onclick = async () => {
                const nuevoNombre = input.value.trim();
                if (!nuevoNombre) {
                    mostrarErrorEditar('El nombre no puede estar vacío');
                    return;
                }
                
                try {
                    const response = await window.API.NombreMaterial.update(nom.idNombreMaterial, { nombre: nuevoNombre });
                    if (response.success) {
                        mostrarSuccessEditar('Nombre de material actualizado correctamente');
                        await cargarNombresMaterial();
                        // Mantener el filtro del buscador
                        const buscadorNombres = document.getElementById('buscador-nombres-editar');
                        const filtroActual = buscadorNombres ? buscadorNombres.value : '';
                        renderizarListaNombresMaterial(filtroActual);
                        // Actualizar dropdown si está visible
                        const selectNombreMaterial = document.getElementById('nombre-material');
                        if (selectNombreMaterial) {
                            updateCustomDropdown(selectNombreMaterial);
                        }
                    } else {
                        mostrarErrorEditar(response.message || 'Error al actualizar nombre de material');
                    }
                } catch (error) {
                    mostrarErrorEditar(error.message || 'Error al actualizar nombre de material');
                }
            };
            
            itemDiv.appendChild(input);
            itemDiv.appendChild(btnGuardar);
            container.appendChild(itemDiv);
        });
    }
    
    function mostrarErrorEditar(mensaje) {
        const errorDiv = document.getElementById('error-editar-cat-nom');
        const successDiv = document.getElementById('success-editar-cat-nom');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
        if (successDiv) successDiv.style.display = 'none';
        setTimeout(() => {
            if (errorDiv) errorDiv.style.display = 'none';
        }, 5000);
    }
    
    function mostrarSuccessEditar(mensaje) {
        const errorDiv = document.getElementById('error-editar-cat-nom');
        const successDiv = document.getElementById('success-editar-cat-nom');
        if (successDiv) {
            successDiv.textContent = mensaje;
            successDiv.style.display = 'block';
        }
        if (errorDiv) errorDiv.style.display = 'none';
        setTimeout(() => {
            if (successDiv) successDiv.style.display = 'none';
        }, 3000);
    }
    
    // Event listeners para cerrar modal de edición (se ejecutarán después de que el modal se cargue)
    window.addEventListener('modales-material-cargados', () => {
        setTimeout(() => {
            const cancelarEditarCatNom = document.getElementById('cancelar-editar-cat-nom');
            const modalEditarCategoriasNombres = document.getElementById('modalEditarCategoriasNombres');
            
            if (cancelarEditarCatNom && !cancelarEditarCatNom.dataset.listenerAdded) {
                cancelarEditarCatNom.dataset.listenerAdded = 'true';
                cancelarEditarCatNom.addEventListener('click', () => {
                    if (modalEditarCategoriasNombres) {
                        modalEditarCategoriasNombres.style.display = 'none';
                    }
                });
            }
            
            if (modalEditarCategoriasNombres && !modalEditarCategoriasNombres.dataset.listenerAdded) {
                modalEditarCategoriasNombres.dataset.listenerAdded = 'true';
                modalEditarCategoriasNombres.addEventListener('click', (e) => {
                    if (e.target === modalEditarCategoriasNombres) {
                        modalEditarCategoriasNombres.style.display = 'none';
                    }
                });
            }
        }, 300);
    });
    
    // También agregar el listener cuando se inicializa (por si el modal ya está cargado)
    setTimeout(() => {
        const cancelarEditarCatNom = document.getElementById('cancelar-editar-cat-nom');
        const modalEditarCategoriasNombres = document.getElementById('modalEditarCategoriasNombres');
        
        if (cancelarEditarCatNom && !cancelarEditarCatNom.dataset.listenerAdded) {
            cancelarEditarCatNom.dataset.listenerAdded = 'true';
            cancelarEditarCatNom.addEventListener('click', () => {
                if (modalEditarCategoriasNombres) {
                    modalEditarCategoriasNombres.style.display = 'none';
                }
            });
        }
        
        if (modalEditarCategoriasNombres && !modalEditarCategoriasNombres.dataset.listenerAdded) {
            modalEditarCategoriasNombres.dataset.listenerAdded = 'true';
            modalEditarCategoriasNombres.addEventListener('click', (e) => {
                if (e.target === modalEditarCategoriasNombres) {
                    modalEditarCategoriasNombres.style.display = 'none';
                }
            });
        }
    }, 500);
    
    console.log('✅ Materiales inicializado');
}

/**
 * Inicialización - Esperar a que los modales estén cargados
 * Solo se ejecuta una vez gracias a la variable materialesInicializado
 */
if (document.readyState === 'loading') {
    // Si el DOM aún se está cargando, esperar el evento
    window.addEventListener('modales-material-cargados', function() {
        if (!materialesInicializado) {
            inicializarMateriales();
        }
    }, { once: true });
    
    // También intentar inicializar después de DOMContentLoaded por si acaso
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (!materialesInicializado) {
                inicializarMateriales();
            }
        }, 100);
    });
} else {
    // Si el DOM ya está listo, esperar el evento de modales cargados
    window.addEventListener('modales-material-cargados', function() {
        if (!materialesInicializado) {
            inicializarMateriales();
        }
    }, { once: true });
    
    // Fallback: intentar inicializar después de un breve delay
    setTimeout(() => {
        if (!materialesInicializado) {
            inicializarMateriales();
        }
    }, 200);
}
