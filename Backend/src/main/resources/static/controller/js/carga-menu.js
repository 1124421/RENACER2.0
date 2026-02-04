/**
 * ============================================
 * SCRIPT DE CARGA DEL MENÚ LATERAL
 * Carga dinámicamente el menú y ajusta el contenido principal
 * ============================================
 */

// Ejecutar inmediatamente si el DOM ya está listo, sino esperar a DOMContentLoaded
(function() {
    'use strict';

    const DEBUG = localStorage.getItem('debugRenacer') === '1';
    const log = (...args) => { if (DEBUG) console.log(...args); };

    const MENU_CACHE_KEY = 'renacer.menuHtml.v1';
    const MENU_CACHE_VERSION = '1';

    function ensureSpaRouter() {
        if (window.RenacerSPA && window.RenacerSPA.__inited) return;
        if (typeof window.RenacerSPAInit === 'function') {
            window.RenacerSPAInit();
            return;
        }
        if (document.getElementById('spa-router-js')) return;
        const s = document.createElement('script');
        s.id = 'spa-router-js';
        s.src = 'controller/js/spa-router.js';
        // Asegurar que cargue antes de que el usuario navegue (mejor UX SPA)
        s.async = false;
        s.onload = () => {
            if (typeof window.RenacerSPAInit === 'function') window.RenacerSPAInit();
        };
        document.body.appendChild(s);
    }

    /**
     * Función principal de inicialización
     * Se ejecuta cuando el DOM está listo
     */
    function inicializarMenu() {
        // 1. Detectar la ubicación del archivo HTML actual para determinar las rutas correctas
        const currentPath = window.location.pathname;
        let menuPath, cssPath;
        
        // Los archivos ahora están en la raíz de static, así que las rutas son simples
        menuPath = 'components/menu.html';
        cssPath = 'css/menu-estilos.css'; 

        // 2. Contenedores y constantes
    const menuContainer = document.getElementById('menu-placeholder'); 
        const sidebarWidthClosed = 80; // Ancho del menú cerrado (solo iconos)
        const sidebarWidthOpen = 200; // Ancho del menú expandido (con textos)

        /**
         * Carga recursos (CSS o JS) dinámicamente
         * @param {string} path - Ruta del recurso
         * @param {string} type - Tipo de recurso ('css' o 'js')
         */
    function cargarRecurso(path, type) {
        if (type === 'css') {
            // Revisa si el CSS ya está cargado para no duplicarlo
            const loaded = document.querySelector(`link[href="${path}"]`);
            if (loaded) return; 

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        } else if (type === 'js') {
            const script = document.createElement('script');
            script.src = path;
            document.body.appendChild(script);
        }
    }
    
        /**
         * Ajusta las rutas del menú según la ubicación actual
         * Esto asegura que los enlaces funcionen correctamente desde cualquier ubicación
         */
        function ajustarRutasMenu() {
            const menuLinks = document.querySelectorAll('.menu a[data-menu-link], .logout a[data-menu-link]');
            
            // Los archivos ahora están en la raíz, las rutas ya son correctas
            // Solo asegurarse de que los nombres de archivo sean correctos (con mayúsculas)
            menuLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('/')) {
                    // Normalizar nombres de archivo para que coincidan con los reales
                    const normalizedHref = href.toLowerCase();
                    if (normalizedHref === 'informe.html') {
                        link.setAttribute('href', 'Informe.html');
                    } else if (normalizedHref === 'material.html') {
                        link.setAttribute('href', 'Material.html');
                    } else if (normalizedHref === 'asociado.html') {
                        link.setAttribute('href', 'asociado.html');
                    } else if (normalizedHref === 'index.html' || normalizedHref === 'index.html') {
                        link.setAttribute('href', 'Index.html');
                    }
                }
            });
        }
        
        /**
         * Resalta el enlace activo en el menú según la página actual
         * Compara la ruta actual con los enlaces del menú para determinar cuál está activo
         */
    function resaltarEnlaceActivo(forcedFile) {
        const raw = forcedFile || (window.location.pathname.split('/').pop() || '');
        const currentFile = decodeURIComponent(String(raw)).split('?')[0].split('#')[0].toLowerCase();

        const menuLinks = document.querySelectorAll('.menu a, .logout a');
        menuLinks.forEach(a => a.classList.remove('enlace--activo'));

        for (const link of menuLinks) {
            const href = (link.getAttribute('href') || '');
            if (!href) continue;
            const linkFile = href.split('?')[0].split('#')[0].split('/').pop().toLowerCase();
            if (linkFile && linkFile === currentFile) {
                link.classList.add('enlace--activo');
                return;
            }
        }
    }

        /**
         * Prefetch de páginas para que la navegación por menú sea más rápida
         */
        const prefetched = new Set();
        function prefetchUrl(href) {
            if (!href) return;
            if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
            if (prefetched.has(href)) return;
            prefetched.add(href);

            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'document';
            link.href = href;
            document.head.appendChild(link);
        }

        function setupPrefetch() {
            document.querySelectorAll('.menu a[data-menu-link], .logout a[data-menu-link]').forEach(a => {
                const href = a.getAttribute('href');
                a.addEventListener('mouseenter', () => prefetchUrl(href), { passive: true });
            });

            const prefetchCore = () => {
                ['Compras.html', 'Material.html', 'Informe.html', 'Inventario.html'].forEach(prefetchUrl);
            };
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(prefetchCore, { timeout: 1500 });
            } else {
                setTimeout(prefetchCore, 800);
            }
        }

        function renderMenuHtml(html, persist = true) {
            if (!menuContainer) return;
            menuContainer.innerHTML = html;
            ajustarRutasMenu();
            resaltarEnlaceActivo();
            ajustarContenidoPrincipal();
            setupPrefetch();
            ensureSpaRouter();

            window.dispatchEvent(new CustomEvent('renacer:menuLoaded'));

            if (persist) {
                try {
                    sessionStorage.setItem(MENU_CACHE_KEY, html);
                    sessionStorage.setItem(`${MENU_CACHE_KEY}.ver`, MENU_CACHE_VERSION);
                } catch (_) {}
            }
        }

        // SPA: actualizar estado activo del menú cuando cambia la URL por pushState (registrar solo una vez)
        if (!window.__renacerMenuNavListenerAdded) {
            window.__renacerMenuNavListenerAdded = true;
            window.addEventListener('renacer:navigated', (e) => {
                try { resaltarEnlaceActivo(e && e.detail ? e.detail.file : undefined); } catch (_) {}
            });
        }

        /**
         * Ajusta el contenido principal cuando el sidebar se expande o contrae
         * Esto asegura que el contenido no quede oculto detrás del menú
         */
    function ajustarContenidoPrincipal() {
        const sidebar = document.querySelector('.sidebar');
        const menuPlaceholder = document.getElementById('menu-placeholder');
        
        // Buscar el contenedor principal (container) que contiene el main-content
        // O buscar directamente main-content si está fuera de container
        const container = document.querySelector('.container');
        const mainContent = document.querySelector('.main-content');
        
        // Determinar qué elementos ajustar
        const elementosAjustar = [];
        if (container) {
            elementosAjustar.push(container);
        } else if (mainContent) {
            elementosAjustar.push(mainContent);
        }
        
        // Si no hay elementos, buscar main directamente
        if (elementosAjustar.length === 0) {
            const main = document.querySelector('main');
            if (main) elementosAjustar.push(main);
        }
        
        if (elementosAjustar.length === 0) {
            console.warn('No se encontraron elementos para ajustar (container, main-content o main)');
            return;
        }
        
        // Aplicar ajustes iniciales inmediatamente para evitar parpadeo
        elementosAjustar.forEach(elemento => {
            // Aplicar transición suave y profesional con cubic-bezier
            elemento.style.transition = 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            elemento.style.willChange = 'margin-left, width';
            
            // Establecer estado inicial (menú cerrado por defecto)
            elemento.style.marginLeft = `${sidebarWidthClosed}px`;
            
            // Ajustar width si es container o main-content
            if (elemento.classList.contains('main-content') || elemento.classList.contains('container')) {
                elemento.style.width = `calc(100% - ${sidebarWidthClosed}px)`;
            }
        });
        
        // Funcionalidad de hover para el sidebar (si existe)
        if (sidebar) {
            sidebar.addEventListener('mouseenter', () => {
                elementosAjustar.forEach(elemento => {
                    elemento.style.marginLeft = `${sidebarWidthOpen}px`;
                    if (elemento.classList.contains('main-content') || elemento.classList.contains('container')) {
                        elemento.style.width = `calc(100% - ${sidebarWidthOpen}px)`;
                    }
                });
            });

            sidebar.addEventListener('mouseleave', () => {
                elementosAjustar.forEach(elemento => {
                    elemento.style.marginLeft = `${sidebarWidthClosed}px`;
                    if (elemento.classList.contains('main-content') || elemento.classList.contains('container')) {
                        elemento.style.width = `calc(100% - ${sidebarWidthClosed}px)`;
                    }
                });
            });
        }
        
        // También manejar hover en el placeholder si el sidebar aún no está cargado
        if (menuPlaceholder && !sidebar) {
            menuPlaceholder.addEventListener('mouseenter', () => {
                elementosAjustar.forEach(elemento => {
                    elemento.style.marginLeft = `${sidebarWidthOpen}px`;
                    if (elemento.classList.contains('main-content') || elemento.classList.contains('container')) {
                        elemento.style.width = `calc(100% - ${sidebarWidthOpen}px)`;
                    }
                });
            });

            menuPlaceholder.addEventListener('mouseleave', () => {
                elementosAjustar.forEach(elemento => {
                    elemento.style.marginLeft = `${sidebarWidthClosed}px`;
                    if (elemento.classList.contains('main-content') || elemento.classList.contains('container')) {
                        elemento.style.width = `calc(100% - ${sidebarWidthClosed}px)`;
                    }
                });
            });
        }
    }

    // ------------------------------------------------------------------
    // 🚀 LÓGICA PRINCIPAL DE CARGA 🚀
    // ------------------------------------------------------------------

    // PASO 0: Ajustar contenido PRIMERO para que siempre haya espacio para el menú
    ajustarContenidoPrincipal();

    if (menuContainer) {
        // 🟢 PASO 1: Cargar el CSS del menú en el <head> 🟢
        cargarRecurso(cssPath, 'css');

        // PASO 1.5: Render instantáneo desde caché (si existe)
        try {
            const ver = sessionStorage.getItem(`${MENU_CACHE_KEY}.ver`);
            const cached = sessionStorage.getItem(MENU_CACHE_KEY);
            if (ver === MENU_CACHE_VERSION && cached) {
                renderMenuHtml(cached, false);
            }
        } catch (_) {}

        // 🟢 PASO 2: Cargar el HTML del menú (fetch) 🟢
        fetch(menuPath, { cache: 'force-cache' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el menú: ' + response.statusText);
                }
                return response.text();
            })
            .then(html => {
                const sidebarHTML = (html || '').trim();
                if (!sidebarHTML) return;
                renderMenuHtml(sidebarHTML, true);
                log('✅ Menú cargado');
            })
            .catch(error => {
                // Aún así, ajustar el contenido para que la página se vea bien
                ajustarContenidoPrincipal();
            });
    } else {
        // Si no hay contenedor, aún ajustar el contenido por si acaso
        ajustarContenidoPrincipal();
    }
    }

    // Cuando navegamos vía SPA, recalcular enlace activo sin recargar (registrado dentro de inicializarMenu)

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarMenu);
    } else {
        // El DOM ya está listo, ejecutar inmediatamente
        inicializarMenu();
    }
})();