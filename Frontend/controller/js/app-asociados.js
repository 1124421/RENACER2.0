// Función principal de inicialización
let asociadosInicializado = false;
async function inicializarAsociados() {
    let asociados = [];
    window.asociadosList = asociados; // Hacer disponible globalmente
    const tbody = document.getElementById("asociadosTbody");
    if (!tbody) return; // no estamos en la página de asociados
    if (asociadosInicializado) return;
    asociadosInicializado = true;

    // ===============================
    // Referencias a Modales y Elementos
    // ===============================

    let asociadoModal, btnNuevo, modalVer, btnCloseVer, btnCloseVerFooter, editarAsociadoModal;
    let searchInput, fechaDesdeInput, fechaHastaInput, estadoSelect, btnLimpiar, btnAplicar;
    let editIndex = null;
    
    // ===============================
    // Utilidades
    // ===============================

    function parseDate(str) {
        if (!str || typeof str !== 'string') return null;
        str = str.trim();
        if (!str) return null;
        if (str.includes('-')) {
            const d = new Date(str + 'T00:00:00');
            return isNaN(d) ? null : d;
        }
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length !== 3) return null;
            const [dd, mm, yyyy] = parts;
            const iso = `${yyyy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T00:00:00`;
            const d = new Date(iso);
            return isNaN(d) ? null : d;
        }
        const d = new Date(str);
        return isNaN(d) ? null : d;
    }

    // ===============================
    // Funciones Globales de Modal
    // ===============================

    window.openModal = (modalId) => {
        console.log('Intentando abrir modal:', modalId);
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('Modal no encontrado:', modalId);
            return;
        }

        // Cierra cualquier otro modal abierto
        document.querySelectorAll('.modal-overlay, .modal').forEach(m => {
            m.classList.remove('open', 'active');
            m.style.display = 'none';
        });
        
        // Abre el modal solicitado
        modal.classList.add('open', 'active');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Re-inicializar botones cuando se abre el modal
        if (modalId === 'asociadoModal' || modalId === 'editarAsociadoModal') {
            setTimeout(() => {
                console.log('🔄 Re-inicializando botones de guardado después de abrir modal:', modalId);
                inicializarBotonesGuardado();
                
                // Verificar que el botón existe
                const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
                if (btnGuardarNuevo) {
                    console.log('✅ btnGuardarNuevo encontrado después de abrir modal');
                } else {
                    console.warn('⚠️ btnGuardarNuevo NO encontrado después de abrir modal');
                }
            }, 200);
        }

        setTimeout(() => { 
            const f = modal.querySelector('input, select, textarea'); 
            if (f) f.focus(); 
        }, 50);
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open', 'active');
            modal.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        }
    };
    
    // ===============================
    // Función para inicializar referencias
    // ===============================
    
    function inicializarReferencias() {
        console.log('🔍 Inicializando referencias...');
        
        // Modales
        asociadoModal = document.getElementById("asociadoModal");
        btnNuevo = document.getElementById("btnNuevo");
        modalVer = document.getElementById("modalVer");
        btnCloseVer = document.getElementById("btnCloseVer");
        btnCloseVerFooter = document.getElementById("btnCloseVerFooter");
        editarAsociadoModal = document.getElementById("editarAsociadoModal");
        
        // Filtros
        searchInput = document.getElementById("searchInput");
        fechaDesdeInput = document.getElementById("fechaDesdeAsociado");
        fechaHastaInput = document.getElementById("fechaHastaAsociado");
        estadoSelect = document.getElementById("estadoAsociado");
        btnLimpiar = document.querySelector('.filter-actions .btn-clear');
        btnAplicar = document.querySelector('.filter-actions .btn-apply');
        
        console.log('Referencias:', {
            asociadoModal: !!asociadoModal,
            editarAsociadoModal: !!editarAsociadoModal,
            btnNuevo: !!btnNuevo
        });
    }
    
    // ===============================
    // Función para inicializar eventos de modales
    // ===============================
    
    function inicializarEventosModales() {
        console.log('🎯 Inicializando eventos de modales...');
        
        // Botón Nuevo Asociado - Handler
        const btnNuevoHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón Nuevo Asociado clickeado');
            editIndex = null;
            
            // Asegurar que el modal esté cargado
            let modal = document.getElementById('asociadoModal');
            if (!modal) {
                console.log('Modal no encontrado, esperando a que se cargue...');
                const btn = document.getElementById('btnNuevo');
                if (btn && btn.dataset.loadingModal === 'true') return;
                if (btn) btn.dataset.loadingModal = 'true';
                try {
                    // Intentar cargar el modal si existe la función
                    if (window.cargarModalAsociado) {
                        await window.cargarModalAsociado('asociadoModal');
                    } else {
                        // Fallback (SPA/race): intentar cargar directo el HTML del modal
                        const cont = document.getElementById('modales-asociados-container');
                        if (cont) {
                            const r = await fetch('modales/asociados/nuevo-asociado.html', { cache: 'force-cache' });
                            if (r.ok) cont.insertAdjacentHTML('beforeend', await r.text());
                        }
                    }
                    // Esperar DOM update
                    await new Promise(resolve => setTimeout(resolve, 200));
                    modal = document.getElementById('asociadoModal');
                } finally {
                    if (btn) btn.dataset.loadingModal = 'false';
                }
            }
            
            if (!modal) {
                console.error('Modal asociadoModal NO encontrado en el DOM');
                if (typeof showError === 'function') {
                    showError('No se pudo cargar el formulario. Por favor, recargue la página.');
                } else {
                    alert('No se pudo cargar el formulario. Por favor, recargue la página.');
                }
                return;
            }
            
            // Limpiar formulario
            const fields = ['newNombre', 'newDocumento', 'newContacto', 'newCorreo', 'newFechaInicio', 'newTipoContrato', 'newCargo', 'newIdUnico', 'newTipoAsociado'];
            fields.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'SELECT') {
                        el.value = '';
                    } else {
                        el.value = '';
                    }
                }
            });
            
            console.log('Modal asociadoModal encontrado, abriendo...');
            window.openModal('asociadoModal');
        };
        
        // Agregar listener directamente al botón si existe
        if (btnNuevo) {
            console.log('Botón btnNuevo encontrado, agregando event listener');
            if (!btnNuevo.dataset.listenerAdded) {
                btnNuevo.dataset.listenerAdded = 'true';
                btnNuevo.addEventListener('click', btnNuevoHandler);
            }
        } else {
            console.error('Botón btnNuevo no encontrado en el DOM');
        }

        // Cierre del modal Ver
        if (btnCloseVer) btnCloseVer.addEventListener('click', () => window.closeModal('modalVer'));
        if (btnCloseVerFooter) btnCloseVerFooter.addEventListener('click', () => window.closeModal('modalVer'));

        // Cierre al hacer clic fuera del contenido del modal
        const modales = [asociadoModal, modalVer, editarAsociadoModal];
        modales.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', e => { 
                    if (e.target === modal || e.target.classList.contains('modal-overlay')) { 
                        window.closeModal(modal.id); 
                    } 
                });
            }
        });
    }

    // ===============================
    // Función para guardar nuevo asociado
    // ===============================
    
    // Función para guardar nuevo asociado (disponible globalmente)
    window.guardarNuevoAsociado = async function(e) {
        console.log('🚀 window.guardarNuevoAsociado llamada');
        
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('💾 Guardando nuevo asociado...');
        
        const nuevoAsociado = {
            nombre: document.getElementById('newNombre')?.value.trim() || '',
            documento: document.getElementById('newDocumento')?.value.trim() || '',
            contacto: document.getElementById('newContacto')?.value.trim() || '',
            correo: document.getElementById('newCorreo')?.value.trim() || '',
            fechaInicio: document.getElementById('newFechaInicio')?.value || '',
            tipoContrato: document.getElementById('newTipoContrato')?.value.trim() || '',
            cargo: document.getElementById('newCargo')?.value.trim() || '',
            idUnico: document.getElementById('newIdUnico')?.value.trim() || '',
            tipoAsociado: document.getElementById('newTipoAsociado')?.value || '',
            ingresos: 0
        };
        
        if (!nuevoAsociado.nombre) {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('Por favor ingrese el nombre del asociado', 'warning');
            } else {
                alert('Por favor ingrese el nombre del asociado');
            }
            document.getElementById('newNombre')?.focus();
            return;
        }
        
        if (!nuevoAsociado.documento) {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('Por favor ingrese el documento del asociado', 'warning');
            } else {
                alert('Por favor ingrese el documento del asociado');
            }
            document.getElementById('newDocumento')?.focus();
            return;
        }
        
        // Guardar en el backend usando API
        if (typeof window.API !== 'undefined') {
            try {
                // Separar nombre y apellido
                const partes = nuevoAsociado.nombre.split(' ');
                const nombre = partes[0] || '';
                const apellido = partes.slice(1).join(' ') || '';
                
                // Obtener un barrio por defecto (el backend requiere un barrio)
                let barrioId = null;
                try {
                    let barrios = await window.API.Barrio.getAll();
                    
                    // Si no hay barrios, crear uno por defecto
                    if (!barrios || barrios.length === 0) {
                        console.log('⚠️ No hay barrios disponibles, creando uno por defecto...');
                        
                        // Primero verificar si hay comunas
                        let comunas = [];
                        if (window.API && window.API.Comuna) {
                            try {
                                comunas = await window.API.Comuna.getAll();
                            } catch (e) {
                                console.warn('No se pudo obtener comunas:', e);
                            }
                        }
                        
                        // Si no hay comunas, crear una por defecto
                        let comunaId = null;
                        if (!comunas || comunas.length === 0) {
                            console.log('⚠️ No hay comunas disponibles, creando una por defecto...');
                            if (window.API && window.API.Comuna) {
                                try {
                                    const nuevaComuna = await window.API.Comuna.create({ nombre: 'Por Definir' });
                                    if (nuevaComuna && nuevaComuna.idComuna) {
                                        comunaId = nuevaComuna.idComuna;
                                        console.log('✅ Comuna por defecto creada:', nuevaComuna.nombre);
                                    }
                                } catch (e) {
                                    console.error('Error al crear comuna por defecto:', e);
                                    throw new Error('No se pudo crear una comuna por defecto. Por favor, cree una comuna y un barrio manualmente en la sección de administración.');
                                }
                            } else {
                                throw new Error('La API de Comuna no está disponible. Por favor, cree una comuna y un barrio manualmente.');
                            }
                        } else {
                            comunaId = comunas[0].idComuna;
                            console.log('✅ Comuna existente encontrada:', comunas[0].nombre);
                        }
                        
                        // Crear barrio por defecto
                        try {
                            const nuevoBarrio = await window.API.Barrio.create({
                                nombre: 'Por Definir',
                                comuna: { idComuna: comunaId }
                            });
                            if (nuevoBarrio && nuevoBarrio.idBarrio) {
                                barrioId = nuevoBarrio.idBarrio;
                                console.log('✅ Barrio por defecto creado:', nuevoBarrio.nombre);
                            }
                        } catch (e) {
                            console.error('Error al crear barrio por defecto:', e);
                            throw new Error('No se pudo crear un barrio por defecto. Por favor, cree un barrio manualmente en la sección de administración.');
                        }
                    } else {
                        // Usar el primer barrio disponible
                        barrioId = barrios[0].idBarrio;
                        console.log('✅ Barrio por defecto obtenido:', barrios[0].nombre);
                    }
                } catch (error) {
                    console.error('❌ Error al obtener/crear barrio:', error);
                    if (typeof showError === 'function') {
                        showError(error.message || 'No se pudo obtener o crear un barrio por defecto. Por favor, cree un barrio manualmente.');
                    } else {
                        alert('Error: ' + (error.message || 'No se pudo obtener o crear un barrio por defecto. Por favor, cree un barrio manualmente.'));
                    }
                    return;
                }
                
                // Validar que el ID esté presente
                const idAsociado = nuevoAsociado.idUnico ? parseInt(nuevoAsociado.idUnico) : null;
                if (!idAsociado || isNaN(idAsociado)) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert('Por favor ingrese un ID válido', 'warning');
                    } else {
                        alert('Por favor ingrese un ID válido');
                    }
                    document.getElementById('newIdUnico')?.focus();
                    return;
                }
                
                const asociadoParaAPI = {
                    idAsociado: idAsociado,
                    nombre: nombre,
                    apellido: apellido,
                    documento: nuevoAsociado.documento,
                    telefono: nuevoAsociado.contacto || null,
                    correo: nuevoAsociado.correo || null,
                    tipo: nuevoAsociado.tipoAsociado || 'No_aforado',
                    fechaInicio: nuevoAsociado.fechaInicio || null,
                    tipoContrato: nuevoAsociado.tipoContrato || null,
                    cargo: nuevoAsociado.cargo || null,
                    barrio: barrioId ? { idBarrio: barrioId } : null
                };
                
                const creado = await window.API.Asociado.create(asociadoParaAPI);
                
                if (!creado || !creado.idAsociado) {
                    throw new Error('No se recibió una respuesta válida del servidor');
                }
                
                // Obtener la lista de asociados actual y actualizarla con los datos completos del servidor
                let asociadosActuales = window.asociadosList || [];
                asociadosActuales.push({
                    id: creado.idAsociado,
                    nombre: `${creado.nombre} ${creado.apellido}`.trim(),
                    nombreSeparado: {
                        nombre: creado.nombre || '',
                        apellido: creado.apellido || ''
                    },
                    documento: creado.documento || '',
                    contacto: creado.telefono || '',
                    correo: creado.correo || '',
                    tipoAsociado: creado.tipo || '',
                    ingresos: 0,
                    barrio: creado.barrio?.nombre || '',
                    barrioId: creado.barrio?.idBarrio || null,
                    // Campos adicionales del formulario
                    fechaInicio: creado.fechaInicio || nuevoAsociado.fechaInicio || '',
                    tipoContrato: creado.tipoContrato || nuevoAsociado.tipoContrato || '',
                    cargo: creado.cargo || nuevoAsociado.cargo || '',
                    idUnico: creado.idAsociado ? creado.idAsociado.toString() : nuevoAsociado.idUnico || ''
                });
                window.asociadosList = asociadosActuales;
                console.log('✅ Asociado agregado a lista local con cargo:', asociadosActuales[asociadosActuales.length - 1].cargo);
                
                // También actualizar la variable local si existe
                if (typeof asociados !== 'undefined') {
                    asociados = asociadosActuales;
                }
                
                console.log('✅ Asociado guardado en backend:', creado);
            } catch (error) {
                console.error('❌ Error al guardar asociado:', error);
                if (typeof showError === 'function') {
                    showError(error.message || 'Error al guardar el asociado');
                } else {
                    alert('Error al guardar el asociado: ' + (error.message || 'Error desconocido'));
                }
                return;
            }
        } else {
            // Fallback a localStorage
            let asociadosActuales = window.asociadosList || [];
            asociadosActuales.push(nuevoAsociado);
            window.asociadosList = asociadosActuales;
            localStorage.setItem('asociados_data', JSON.stringify(asociadosActuales));
        }
        
        console.log('✅ Asociado guardado:', nuevoAsociado);
        console.log('📊 Total asociados:', (window.asociadosList || []).length);
        
        // Limpiar formulario
        ['newNombre', 'newDocumento', 'newContacto', 'newCorreo', 'newFechaInicio', 'newTipoContrato', 'newCargo', 'newIdUnico', 'newTipoAsociado'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SELECT') {
                    el.value = '';
                } else {
                    el.value = '';
                }
            }
        });
        
        // Cerrar modal
        window.closeModal('asociadoModal');
        
        // Mostrar mensaje de éxito
        if (typeof showSuccess === 'function') {
            showSuccess('Asociado guardado exitosamente');
        } else {
            alert('Asociado guardado exitosamente');
        }
        
        // Recargar la lista de asociados recargando la página
        // Esto asegura que todo esté sincronizado
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    // ===============================
    // Función para inicializar botones de guardado
    // ===============================
    
    function inicializarBotonesGuardado() {
        console.log('🔧 Inicializando botones de guardado...');
        
        // Botón Guardar Nuevo Asociado
        const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
        if (btnGuardarNuevo) {
            console.log('✅ btnGuardarNuevo encontrado');
            
            // Remover todos los event listeners anteriores clonando el botón
            const newBtnNuevo = btnGuardarNuevo.cloneNode(true);
            btnGuardarNuevo.parentNode.replaceChild(newBtnNuevo, btnGuardarNuevo);
            
            // Agregar event listener usando la función global
            newBtnNuevo.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Click en btnGuardarNuevo detectado');
                if (typeof window.guardarNuevoAsociado === 'function') {
                    await window.guardarNuevoAsociado(e);
                } else {
                    console.error('❌ window.guardarNuevoAsociado no está disponible');
                    alert('Error: La función de guardado no está disponible. Por favor, recargue la página.');
                }
            });
            
            console.log('✅ Event listener agregado a btnGuardarNuevo');
        } else {
            console.warn('⚠️ btnGuardarNuevo NO encontrado en el DOM (se usará event delegation)');
        }
        
        // Botón Guardar Editar Asociado
        const btnGuardarEditar = document.getElementById('btnGuardarEditar');
        console.log('🔍 Buscando btnGuardarEditar:', btnGuardarEditar);
        
        if (btnGuardarEditar) {
            console.log('✅ btnGuardarEditar encontrado');
            
            // Remover listeners antiguos clonando el botón
            const newBtnEditar = btnGuardarEditar.cloneNode(true);
            btnGuardarEditar.parentNode.replaceChild(newBtnEditar, btnGuardarEditar);
            
            newBtnEditar.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('💾 Guardando edición de asociado...');
                console.log('📝 editIndex:', editIndex);
                
                if (editIndex === null || editIndex < 0 || editIndex >= asociados.length) {
                    console.error('❌ editIndex inválido:', editIndex);
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert('Error: No se puede editar este asociado', 'error');
                    } else {
                        alert('Error: No se puede editar este asociado');
                    }
                    return;
                }
                
                const asociadoEditado = {
                    nombre: document.getElementById('editNombre')?.value.trim() || '',
                    documento: document.getElementById('editDocumento')?.value.trim() || '',
                    contacto: document.getElementById('editContacto')?.value.trim() || '',
                    correo: document.getElementById('editCorreo')?.value.trim() || '',
                    fechaInicio: document.getElementById('editFechaInicio')?.value || '',
                    contrato: document.getElementById('editContrato')?.value.trim() || '',
                    cargo: document.getElementById('editCargo')?.value.trim() || '',
                    idUnico: document.getElementById('editIdUnico')?.value.trim() || '',
                    tipoAsociado: document.getElementById('editTipoAsociado')?.value.trim() || '',
                    ingresos: asociados[editIndex].ingresos || 0
                };
                
                console.log('📝 Datos a guardar:', asociadoEditado);
                
                if (!asociadoEditado.nombre) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert('Por favor ingrese el nombre del asociado', 'warning');
                    } else {
                        alert('Por favor ingrese el nombre del asociado');
                    }
                    document.getElementById('editNombre')?.focus();
                    return;
                }
                
                if (!asociadoEditado.documento) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert('Por favor ingrese el documento del asociado', 'warning');
                    } else {
                        alert('Por favor ingrese el documento del asociado');
                    }
                    document.getElementById('editDocumento')?.focus();
                    return;
                }
                
                // Actualizar en el backend usando API
                if (typeof window.API !== 'undefined' && asociados[editIndex]?.id) {
                    try {
                        const partes = asociadoEditado.nombre.split(' ');
                        const nombre = partes[0] || '';
                        const apellido = partes.slice(1).join(' ') || '';
                        
                        // Obtener un barrio válido (usar el existente o uno por defecto)
                        let barrioId = null;
                        try {
                            // Intentar obtener el barrio actual del asociado
                            const asociadoActual = await window.API.Asociado.getById(asociados[editIndex].id);
                            if (asociadoActual && asociadoActual.barrio && asociadoActual.barrio.idBarrio) {
                                barrioId = asociadoActual.barrio.idBarrio;
                                console.log('✅ Usando barrio existente del asociado:', barrioId);
                            } else {
                                // Si no tiene barrio, obtener uno por defecto
                                let barrios = await window.API.Barrio.getAll();
                                if (barrios && barrios.length > 0) {
                                    barrioId = barrios[0].idBarrio;
                                    console.log('✅ Usando barrio por defecto:', barrioId);
                                } else {
                                    // Si no hay barrios, crear uno automáticamente
                                    console.log('⚠️ No hay barrios disponibles, creando uno por defecto...');
                                    
                                    // Obtener comunas
                                    let comunas = [];
                                    if (window.API && window.API.Comuna) {
                                        try {
                                            comunas = await window.API.Comuna.getAll();
                                        } catch (e) {
                                            console.warn('No se pudo obtener comunas:', e);
                                        }
                                    }
                                    
                                    // Crear comuna si no existe
                                    let comunaId = null;
                                    if (!comunas || comunas.length === 0) {
                                        if (window.API && window.API.Comuna) {
                                            const nuevaComuna = await window.API.Comuna.create({ nombre: 'Por Definir' });
                                            if (nuevaComuna && nuevaComuna.idComuna) {
                                                comunaId = nuevaComuna.idComuna;
                                            }
                                        }
                                    } else {
                                        comunaId = comunas[0].idComuna;
                                    }
                                    
                                    // Crear barrio
                                    if (comunaId) {
                                        const nuevoBarrio = await window.API.Barrio.create({
                                            nombre: 'Por Definir',
                                            comuna: { idComuna: comunaId }
                                        });
                                        if (nuevoBarrio && nuevoBarrio.idBarrio) {
                                            barrioId = nuevoBarrio.idBarrio;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Error al obtener barrio:', e);
                            throw new Error('No se pudo obtener un barrio válido. Por favor, verifique que haya barrios en el sistema.');
                        }
                        
                        const carreta = document.getElementById('editCarreta')?.value?.trim() || null;
                        const rutaNombre = document.getElementById('editRuta')?.value?.trim() || null;
                        
                        // Buscar barrio por nombre si hay ruta
                        let barrioFinalId = barrioId;
                        if (rutaNombre && !barrioId) {
                            const barriosRes = await window.API.Barrio.getAll();
                            const barrios = barriosRes.success ? barriosRes.data : (Array.isArray(barriosRes) ? barriosRes : []);
                            const barrioEncontrado = barrios.find(b => b.nombre === rutaNombre);
                            if (barrioEncontrado) {
                                barrioFinalId = barrioEncontrado.idBarrio;
                            }
                        }
                        
                        const asociadoParaAPI = {
                            idAsociado: asociados[editIndex].id, // Mantener el mismo ID al editar
                            nombre: nombre,
                            apellido: apellido,
                            documento: asociadoEditado.documento,
                            telefono: asociadoEditado.contacto || null,
                            correo: asociadoEditado.correo || null,
                            tipo: asociadoEditado.tipoAsociado === 'Aforado' ? 'Aforado' : 'No_aforado',
                            carreta: carreta || null,
                            fechaInicio: asociadoEditado.fechaInicio || null,
                            tipoContrato: asociadoEditado.contrato || null,
                            cargo: asociadoEditado.cargo || null,
                            barrio: barrioFinalId ? { idBarrio: barrioFinalId } : null
                        };
                        
                        await window.API.Asociado.update(asociados[editIndex].id, asociadoParaAPI);
                        asociados[editIndex] = { ...asociados[editIndex], ...asociadoEditado };
                        window.asociadosList = asociados; // Actualizar lista global
                        
                        console.log('✅ Asociado actualizado en backend');
                    } catch (error) {
                        console.error('❌ Error al actualizar asociado:', error);
                        if (typeof showError === 'function') {
                            showError(error.message || 'Error al actualizar el asociado');
                        } else {
                            alert('Error al actualizar el asociado: ' + (error.message || 'Error desconocido'));
                        }
                        return;
                    }
                } else {
                    // Fallback a localStorage
                    asociados[editIndex] = asociadoEditado;
                    window.asociadosList = asociados; // Actualizar lista global
                    localStorage.setItem('asociados_data', JSON.stringify(asociados));
                }
                
                console.log('✅ Asociado actualizado:', asociadoEditado);
                
                applyCurrentFiltersAndRender();
                window.closeModal('editarAsociadoModal');
                editIndex = null;
                
                if (typeof showSuccess === 'function') {
                    showSuccess('Actualizado correctamente');
                } else {
                    alert('Actualizado correctamente');
                }
                
                // Recargar la página para sincronizar con toda la aplicación
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
            
            console.log('✅ Event listener agregado a btnGuardarEditar');
        } else {
            console.error('❌ btnGuardarEditar NO encontrado en el DOM');
            console.log('🔍 Elementos en editarAsociadoModal:', 
                editarAsociadoModal ? Array.from(editarAsociadoModal.querySelectorAll('*')).map(el => el.id || el.className) : 'Modal no encontrado'
            );
        }
    }
    
    // ===============================
    // Rendering (la lista de asociados en la tabla)
    // ===============================

    function renderTable(list = null) {
        const data = Array.isArray(list) ? list : asociados;
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No hay asociados registrados</td></tr>';
            return;
        }
        
        data.forEach((a, index) => {
            const tr = document.createElement('tr');
            const ingresos = Number(a.ingresos || 0);
            
            // Formatear datos
            const idAsociado = a.idUnico || a.id || 'Sin ID';
            const nombreCompleto = a.nombre || 'Sin nombre';
            const documento = a.documento || 'Sin documento';
            const contacto = a.contacto || 'Sin teléfono';
            const tipoAsociado = a.tipoAsociado || 'No especificado';
            
            tr.innerHTML = `
                <td>${idAsociado}</td>
                <td>${nombreCompleto}</td>
                <td>${documento}</td>
                <td>${contacto}</td>
                <td>
                    <span class="ingreso-badge">${ingresos} Ingreso${ingresos !== 1 ? 's' : ''}</span>
                    ${tipoAsociado ? `<br><small style="color: #666; font-size: 0.85em;">${tipoAsociado}</small>` : ''}
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" onclick="window.verAsociado(${index})" title="Ver"> 
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
                        </button>
                        <button class="action-btn edit" onclick="window.editarAsociado(${index})" title="Editar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="window.eliminarAsociado(${index})" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ===============================
    // Handlers de Acciones de la Tabla
    // ===============================

    window.verAsociado = async (i) => {
        console.log('verAsociado llamado con índice:', i);
        if (i < 0 || i >= asociados.length) {
            console.error('Índice de asociado inválido:', i);
            return;
        }
        const a = asociados[i];
        console.log('Datos del asociado (lista local):', a);
        
        // Obtener datos completos desde la API para asegurar que tenemos toda la información
        let asociadoCompleto = a;
        if (a.id && typeof window.API !== 'undefined') {
            try {
                const asociadoApi = await window.API.Asociado.getById(a.id);
                console.log('Datos del asociado (desde API):', asociadoApi);
                console.log('📋 Cargo desde API:', asociadoApi.cargo);
                // Mapear al formato esperado (solo los campos que el usuario ingresó)
                asociadoCompleto = {
                    id: asociadoApi.idAsociado,
                    nombre: `${asociadoApi.nombre} ${asociadoApi.apellido}`.trim(),
                    nombreSeparado: {
                        nombre: asociadoApi.nombre || '',
                        apellido: asociadoApi.apellido || ''
                    },
                    documento: asociadoApi.documento || '',
                    contacto: asociadoApi.telefono || '',
                    correo: asociadoApi.correo || '',
                    tipoAsociado: asociadoApi.tipo || '',
                    carreta: asociadoApi.carreta || '',
                    barrio: asociadoApi.barrio?.nombre || '',
                    barrioId: asociadoApi.barrio?.idBarrio || null,
                    // Campos adicionales del formulario
                    fechaInicio: asociadoApi.fechaInicio || '',
                    contrato: asociadoApi.tipoContrato || '',
                    cargo: asociadoApi.cargo || '',
                    idUnico: asociadoApi.idAsociado ? asociadoApi.idAsociado.toString() : ''
                };
                console.log('✅ Cargo mapeado:', asociadoCompleto.cargo);
            } catch (error) {
                console.error('Error al obtener datos completos del asociado:', error);
                // Usar los datos locales si falla la API
            }
        }
        
        // Actualizar avatar con iniciales
        const avatarEl = document.getElementById("avatarInitials");
        if (avatarEl && typeof getInitials === 'function') {
            avatarEl.textContent = getInitials(asociadoCompleto.nombre);
        }
        
        // Actualizar nombre completo
        const verNombreEl = document.getElementById("verNombre");
        if (verNombreEl) {
            verNombreEl.textContent = asociadoCompleto.nombre || 'Sin nombre';
        }
        
        // Actualizar cargo en el header (usar cargo específico o tipo de asociado como fallback)
        const verCargoHeaderEl = document.getElementById("verCargoHeader");
        if (verCargoHeaderEl) {
            const cargoHeader = asociadoCompleto.cargo || asociadoCompleto.tipoAsociado || 'Sin especificar';
            verCargoHeaderEl.textContent = cargoHeader;
            console.log('📋 Cargo en header actualizado:', cargoHeader);
        }
        
        // Actualizar campos disponibles del backend (solo los que el usuario ingresó)
        const campos = {
            verDocumento: asociadoCompleto.documento || '-',
            verTelefono: asociadoCompleto.contacto || '-',
            verCorreo: asociadoCompleto.correo || '-',
            verTipoAsociado: asociadoCompleto.tipoAsociado || '-',
            verCarreta: asociadoCompleto.carreta || '-',
            verBarrio: asociadoCompleto.barrio || '-',
            // Campos del formulario
            verFechaInicio: asociadoCompleto.fechaInicio || '-',
            verContrato: asociadoCompleto.contrato || '-',
            verCargo: asociadoCompleto.cargo || '-',
            verIdUnico: asociadoCompleto.idUnico || (asociadoCompleto.id ? asociadoCompleto.id.toString() : '-')
        };
        
        console.log('📋 Cargo a mostrar:', campos.verCargo);
        
        Object.keys(campos).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = campos[id];
                // Si el campo está vacío o es "-", agregar estilo para indicarlo
                if (campos[id] === '-' || !campos[id] || campos[id].trim() === '') {
                    el.style.color = '#999';
                    el.style.fontStyle = 'italic';
                } else {
                    el.style.color = '';
                    el.style.fontStyle = '';
                }
                if (id === 'verCargo') {
                    console.log(`✅ Campo ${id} actualizado con:`, campos[id]);
                }
            } else if (id === 'verCargo') {
                console.error(`❌ Campo ${id} no encontrado en el DOM`);
            }
        });

        console.log('Abriendo modal modalVer');
        window.openModal('modalVer');
    };

    window.editarAsociado = (i) => {
        console.log('🖊️ editarAsociado llamado con índice:', i);
        if (i < 0 || i >= asociados.length) return;
        editIndex = i; 
        const a = asociados[i];

                const campos = {
                    editIdUnico: a.idUnico || a.id?.toString() || '',
                    editNombre: a.nombre || '',
                    editDocumento: a.documento || '',
                    editContacto: a.contacto || a.telefono || '',
                    editCorreo: a.correo || '',
                    editFechaInicio: a.fechaInicio || '',
                    editCarreta: a.carreta || '',
                    editRuta: a.barrio?.nombre || a.ruta || '',
                    editTipoAsociado: a.tipoAsociado || a.tipo || ''
                };
        
        Object.keys(campos).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = campos[id];
                console.log(`Campo ${id} actualizado con:`, campos[id]);
            } else {
                console.error(`Campo ${id} no encontrado`);
            }
        });
        
        console.log('Abriendo modal editarAsociadoModal');
        window.openModal('editarAsociadoModal');
        
        // Verificar que el botón existe después de abrir el modal
        setTimeout(() => {
            const btn = document.getElementById('btnGuardarEditar');
            console.log('🔍 Verificando botón después de abrir modal:', btn);
        }, 100);
    };

    window.eliminarAsociado = async (i) => {
        if (i < 0 || i >= asociados.length) return;
        
        const confirmar = await confirm('¿Está seguro de que desea eliminar este asociado?', {
            title: 'Confirmar eliminación',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'warning'
        });
        
        if (!confirmar) return;
        
        const asociadoAEliminar = asociados[i];
        
        // Eliminar del backend usando API
        if (typeof window.API !== 'undefined' && asociadoAEliminar?.id) {
            try {
                await window.API.Asociado.delete(asociadoAEliminar.id);
                asociados.splice(i, 1);
                console.log('✅ Asociado eliminado del backend');
            } catch (error) {
                console.error('❌ Error al eliminar asociado:', error);
                showError(error.message || 'Error al eliminar el asociado');
                return;
            }
        } else {
            // Fallback a localStorage
            asociados.splice(i, 1);
            localStorage.setItem('asociados_data', JSON.stringify(asociados));
        }
        
        applyCurrentFiltersAndRender();
        showSuccess('Asociado eliminado exitosamente');
    };

    // ===============================
    // Lógica de Filtros
    // ===============================
    
    function matchesSearch(a, term) {
        if (!term) return true;
        term = term.toLowerCase();
        return (a.nombre || '').toLowerCase().includes(term)
            || (a.documento || '').toLowerCase().includes(term)
            || (a.contacto || '').toLowerCase().includes(term)
            || (a.idUnico || '').toLowerCase().includes(term);
    }

    function matchesEstado(a, estado) {
        if (!estado || estado === 'Todos') return true;
        return (a.tipoAsociado || '') === estado; 
    }

    function matchesDateRange(a, desdeStr, hastaStr) {
        if (!desdeStr && !hastaStr) return true;
        const itemDate = parseDate(a.fechaInicio);
        if (!itemDate) return false;
        
        const desde = desdeStr ? parseDate(desdeStr) : null;
        const hasta = hastaStr ? parseDate(hastaStr) : null;
        
        if (desde && itemDate < desde) return false;
        
        if (hasta) {
            const endOfDay = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59);
            if (itemDate > endOfDay) return false;
        }
        return true;
    }

    function applyFilters(term, desdeStr, hastaStr, estado) {
        return asociados.filter(a => matchesSearch(a, term) && matchesEstado(a, estado) && matchesDateRange(a, desdeStr, hastaStr));
    }

    function applyCurrentFiltersAndRender() {
        const term = searchInput ? searchInput.value.trim() : '';
        const desdeStr = fechaDesdeInput ? fechaDesdeInput.value : '';
        const hastaStr = fechaHastaInput ? fechaHastaInput.value : '';
        const estado = estadoSelect ? estadoSelect.value : 'Todos';
        const filtered = applyFilters(term, desdeStr, hastaStr, estado);
        renderTable(filtered);
    }
    
    // Hacer disponible globalmente
    window.applyCurrentFiltersAndRenderAsociados = applyCurrentFiltersAndRender;

    // ===============================
    // Función para inicializar filtros
    // ===============================
    
    function inicializarFiltros() {
        console.log('🔍 Inicializando filtros...');
        
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => applyCurrentFiltersAndRender(), 200);
            });
        }

        if (btnAplicar) btnAplicar.addEventListener('click', () => applyCurrentFiltersAndRender());
        if (btnLimpiar) btnLimpiar.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (fechaDesdeInput) fechaDesdeInput.value = '';
            if (fechaHastaInput) fechaHastaInput.value = '';
            if (estadoSelect) estadoSelect.value = 'Todos';
            applyCurrentFiltersAndRender();
        });
    }

    // ===============================
    // Inicialización - Cargar desde API
    // ===============================
    try {
        if (typeof window.API !== 'undefined') {
            asociados = await window.API.Asociado.getAll();
            // Convertir formato del backend al formato del frontend
            asociados = asociados.map(a => ({
                id: a.idAsociado,
                nombre: `${a.nombre} ${a.apellido}`.trim(),
                nombreSeparado: {
                    nombre: a.nombre || '',
                    apellido: a.apellido || ''
                },
                documento: a.documento || '',
                contacto: a.telefono || '',
                correo: a.correo || '',
                tipoAsociado: a.tipo || '',
                ingresos: 0, // Esto se calcularía desde los ingresos
                carreta: a.carreta || '',
                barrio: a.barrio?.nombre || '',
                barrioId: a.barrio?.idBarrio || null,
                // Campos adicionales del formulario
                fechaInicio: a.fechaInicio || '',
                contrato: a.tipoContrato || '',
                cargo: a.cargo || '',
                idUnico: a.idAsociado ? a.idAsociado.toString() : ''
            }));
            // Actualizar la lista global
            window.asociadosList = asociados;
            console.log('✅ Asociados cargados desde API:', asociados.length);
        } else {
            console.warn('⚠️ API no disponible, usando datos locales');
            const stored = localStorage.getItem('asociados_data');
            if (stored) asociados = JSON.parse(stored);
            // Actualizar la lista global
            window.asociadosList = asociados;
        }
    } catch (e) {
        console.error('❌ Error al cargar asociados:', e);
        asociados = [];
        window.asociadosList = asociados;
    }
    
    // Inicializar referencias primero
    inicializarReferencias();
    
    // Luego inicializar eventos
    inicializarEventosModales();
    inicializarFiltros();
    
    // Inicializar botones de guardado DESPUÉS de que los modales se carguen
    // También re-inicializar después de un pequeño delay para asegurar que los modales estén en el DOM
    setTimeout(() => {
        inicializarBotonesGuardado();
    }, 200);
    
    // Renderizar tabla
    applyCurrentFiltersAndRender();
}

// Esperar a que el DOM esté listo y los modales se hayan cargado
function renacerBootAsociados() {
    console.log('🚀 DOM Content Loaded');
    
    if (document.getElementById('modales-asociados-container')) {
        console.log('📦 Contenedor de modales encontrado, esperando carga...');
        
        window.addEventListener('modales-asociados-cargados', () => {
            console.log('✅ Modales cargados, inicializando app-asociados...');
            // Re-inicializar referencias después de que los modales se carguen
            setTimeout(() => {
                inicializarAsociados();
            }, 100);
        });
        
        // Backup: Si los modales ya están cargados o se cargan después
        setTimeout(() => {
            const modalAsociado = document.getElementById('asociadoModal');
            const modalEditar = document.getElementById('editarAsociadoModal');
            if (modalAsociado || modalEditar) {
                console.log('⚡ Modales encontrados, inicializando...');
                inicializarAsociados();
            } else {
                // Intentar de nuevo después de más tiempo
                setTimeout(() => {
                    console.log('🔄 Reintentando inicialización...');
                    inicializarAsociados();
                }, 1000);
            }
        }, 500);
    } else {
        console.log('⚠️ Contenedor de modales no encontrado, inicializando directamente...');
        inicializarAsociados();
    }
    
    // También inicializar inmediatamente para que el botón funcione
    inicializarAsociados();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerBootAsociados);
} else {
    renacerBootAsociados();
}

// Event listener delegado global como respaldo (solo se agrega una vez)
if (!window.asociadosEventDelegationAdded) {
    window.asociadosEventDelegationAdded = true;
    document.addEventListener('click', async (e) => {
        // Botón Guardar Nuevo
        if (e.target && (e.target.id === 'btnGuardarNuevo' || e.target.closest('#btnGuardarNuevo'))) {
            const btn = e.target.id === 'btnGuardarNuevo' ? e.target : e.target.closest('#btnGuardarNuevo');
            if (btn && !btn.dataset.procesado) {
                btn.dataset.procesado = 'true';
                setTimeout(() => delete btn.dataset.procesado, 1000);
                console.log('🔄 Event delegation global capturó clic en btnGuardarNuevo');
                if (typeof window.guardarNuevoAsociado === 'function') {
                    await window.guardarNuevoAsociado(e);
                } else {
                    console.error('❌ window.guardarNuevoAsociado no está disponible');
                    alert('Error: La función de guardado no está disponible. Por favor, recargue la página.');
                }
            }
        }
        
        // Botón Guardar Editar
        if (e.target && (e.target.id === 'btnGuardarEditar' || e.target.closest('#btnGuardarEditar'))) {
            const btn = e.target.id === 'btnGuardarEditar' ? e.target : e.target.closest('#btnGuardarEditar');
            if (btn && !btn.dataset.procesado) {
                btn.dataset.procesado = 'true';
                setTimeout(() => delete btn.dataset.procesado, 1000);
                console.log('🔄 Event delegation global capturó clic en btnGuardarEditar');
                // El event listener directo debería manejar esto, pero si no está disponible, aquí estaría el respaldo
                // El código del event listener directo ya está implementado en inicializarBotonesGuardado()
            }
        }
    }, true);
    console.log('✅ Event listener delegado global para botones de asociados agregado');
}