// ==========================================
// ARCHIVO: controller/js/libs/select.js
// ==========================================

// Inicializar menús desplegables personalizados
function initCustomDropdowns() {
  const selects = document.querySelectorAll('select:not(.flatpickr-monthDropdown-months)');
  
  selects.forEach(select => {
    // Evitar duplicados
    if (select.parentElement?.classList.contains('menu-desplegable-wrapper') || 
        select.closest('.flatpickr-calendar') ||
        select.dataset.customized === 'true') {
      return;
    }
    
    // Marcar como procesado
    select.dataset.customized = 'true';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'menu-desplegable-wrapper';
    
    const trigger = document.createElement('div');
    trigger.className = 'menu-desplegable-trigger';
    trigger.textContent = select.options[select.selectedIndex]?.text || 'Seleccione una opción';
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'menu-desplegable-options';
    optionsContainer.id = `options-${select.id || 'select-' + Math.random().toString(36).substr(2, 9)}`;
    optionsContainer.dataset.selectId = select.id || '';
    
    // Agregar campo de búsqueda si el select tiene el atributo data-searchable
    let searchInput = null;
    if (select.hasAttribute('data-searchable')) {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'menu-desplegable-search';
        searchInput.placeholder = 'Buscar...';
        searchInput.style.cssText = 'width: 100%; padding: 8px; border: none; border-bottom: 1px solid #ddd; outline: none; box-sizing: border-box;';
        optionsContainer.appendChild(searchInput);
    }
    
    const renderOptions = (filterTerm = '') => {
        // Limpiar opciones anteriores (excepto el campo de búsqueda)
        const existingOptions = Array.from(optionsContainer.children).filter(child => child !== searchInput);
        existingOptions.forEach(child => child.remove());
        
        const filterLower = filterTerm.toLowerCase().trim();
        
        Array.from(select.options).forEach((option, index) => {
            // Filtrar opciones si hay término de búsqueda
            if (filterTerm && !option.text.toLowerCase().includes(filterLower)) {
                return;
            }
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'menu-desplegable-option';
            optionDiv.textContent = option.text;
            optionDiv.dataset.value = option.value;
            
            if (index === select.selectedIndex) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.addEventListener('click', () => {
                select.selectedIndex = index;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                
                trigger.textContent = option.text;
                optionsContainer.querySelectorAll('.menu-desplegable-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionDiv.classList.add('selected');
                
                trigger.classList.remove('active');
                optionsContainer.classList.remove('active');
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                // Limpiar campo de búsqueda cuando se selecciona una opción
                if (searchInput) {
                    searchInput.value = '';
                }
            });
            
            optionsContainer.appendChild(optionDiv);
        });
    };
    
    // Renderizar opciones iniciales
    renderOptions();
    
    // Agregar listener de búsqueda si existe el campo
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderOptions(e.target.value);
        });
        
        // Prevenir que el clic en el input cierre el dropdown
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Enfocar el campo de búsqueda cuando se abre el dropdown
        trigger.addEventListener('click', () => {
            setTimeout(() => {
                if (searchInput && optionsContainer.classList.contains('active')) {
                    searchInput.focus();
                }
            }, 100);
        });
    }
    
    let animationFrameId = null;
    
    const updatePosition = () => {
      const rect = trigger.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      optionsContainer.style.top = `${rect.bottom + scrollY + 8}px`;
      optionsContainer.style.left = `${rect.left}px`;
      optionsContainer.style.width = `${rect.width}px`;
    };
    
    const startPositionTracking = () => {
      const track = () => {
        if (trigger.classList.contains('active')) {
          updatePosition();
          animationFrameId = requestAnimationFrame(track);
        }
      };
      track();
    };
    
    const stopPositionTracking = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = trigger.classList.contains('active');
      
      document.querySelectorAll('.menu-desplegable-trigger.active').forEach(t => {
        t.classList.remove('active');
      });
      document.querySelectorAll('.menu-desplegable-options.active').forEach(o => {
        o.classList.remove('active');
      });
      stopPositionTracking();
      
      if (!isActive) {
        updatePosition();
        trigger.classList.add('active');
        optionsContainer.classList.add('active');
        startPositionTracking();
      }
    });
    
    // Cerrar cuando se abre un modal
    wrapper.addEventListener('modalOpen', () => {
      trigger.classList.remove('active');
      optionsContainer.classList.remove('active');
      stopPositionTracking();
    });
    
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(trigger);
    wrapper.dataset.optionsContainerId = optionsContainer.id;
    document.body.appendChild(optionsContainer);
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.menu-desplegable-trigger.active').forEach(t => {
    t.classList.remove('active');
  });
  document.querySelectorAll('.menu-desplegable-options.active').forEach(o => {
    o.classList.remove('active');
  });
  if (window.currentAnimationFrameId) {
    cancelAnimationFrame(window.currentAnimationFrameId);
  }
}

document.addEventListener('click', closeAllDropdowns);

// Cerrar cuando se hace click en cualquier botón que abre modales
document.addEventListener('click', (e) => {
  const target = e.target.closest('button, .card, [onclick]');
  if (target && (target.id === 'btnNuevo' || target.textContent.includes('Nuevo') || target.onclick)) {
    setTimeout(closeAllDropdowns, 50);
  }
}, true);

// Cerrar menús desplegables cuando se abre un modal
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Detectar modales por clase o atributo
        if (node.classList?.contains('modal-overlay') || 
            node.classList?.contains('modal') ||
            node.querySelector?.('.modal-overlay') ||
            node.querySelector?.('.modal') ||
            node.id?.includes('modal') ||
            node.style?.display === 'flex') {
          closeAllDropdowns();
        }
      }
    });
    
    // Detectar cambios de estilo que muestran modales
    mutation.target?.querySelectorAll?.('.modal, .modal-overlay, [id*="modal"]').forEach(modal => {
      if (modal.style.display === 'flex' || modal.classList.contains('active') || modal.classList.contains('open')) {
        closeAllDropdowns();
      }
    });
  });
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomDropdowns);
} else {
  initCustomDropdowns();
}