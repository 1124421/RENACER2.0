// Script para cargar el encabezado dinámicamente con el nombre del módulo correspondiente
document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-placeholder');
    if (!headerContainer) {
        console.warn('No se encontró el contenedor de encabezado (#header-placeholder)');
        return;
    }

    const DEBUG = localStorage.getItem('debugRenacer') === '1';
    const log = (...args) => { if (DEBUG) console.log(...args); };

    // Asegurar que el CSS de modo daltónico se cargue al FINAL (para pisar verdes hardcodeados)
    const DALTONICO_CSS_VERSION = '4'; // subir número si el navegador cachea
    function ensureDaltonicoCssLast() {
        let link = document.getElementById('daltonico-css');
        if (!link) {
            link = document.createElement('link');
            link.id = 'daltonico-css';
            link.rel = 'stylesheet';
        }
        link.href = `css/daltonico.css?v=${DALTONICO_CSS_VERSION}`;
        // appendChild mueve el nodo al final si ya existe
        document.head.appendChild(link);
    }
    ensureDaltonicoCssLast();

    function getCurrentFile() {
        const currentPath = window.location.pathname;
        return (currentPath.split('/').pop() || currentPath.split('\\').pop() || '').toLowerCase();
    }

    // Página actual (para estilos condicionales)
    let currentFile = getCurrentFile();
    document.body.dataset.page = currentFile;

    // ===========================
    // Modo daltónico (persistente)
    // ===========================
    const DALTONICO_KEY = 'modoDaltonico';

    const isDaltonicoEnabled = () => localStorage.getItem(DALTONICO_KEY) === '1';

    const applyDaltonico = (enabled) => {
        document.body.classList.toggle('daltonico', !!enabled);
        ensureDaltonicoCssLast();
    };

    const syncDaltonicoButton = (btn) => {
        if (!btn) return;
        const enabled = document.body.classList.contains('daltonico');
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        btn.title = enabled ? 'Modo daltónico: activado' : 'Modo daltónico: desactivado';
    };

    const toggleDaltonico = () => {
        const next = !document.body.classList.contains('daltonico');
        applyDaltonico(next);
        localStorage.setItem(DALTONICO_KEY, next ? '1' : '0');
        syncDaltonicoButton(document.getElementById('btnDaltonico'));
    };

    // Aplicar al cargar
    applyDaltonico(isDaltonicoEnabled());
    window.toggleModoDaltonico = toggleDaltonico;
    // Re-asegurar al final del frame (por CSS dinámico del menú)
    requestAnimationFrame(() => ensureDaltonicoCssLast());

    // Mapa de nombres de módulos según el archivo HTML
        const moduleNames = {
            'perfil.html': 'Perfil',
            'Perfil.html': 'Perfil',
            'Configuracion.html': 'Configuración',
            'configuracion.html': 'Configuración',
        'inicio.html': 'Panel principal',
        'Inicio.html': 'Panel principal',
        'Compras.html': 'Compras',
        'compras.html': 'Compras',
        'Ventas.html': 'Ventas',
        'ventas.html': 'Ventas',
        'asociado.html': 'Asociados',
        'Asociado.html': 'Asociados',
        'Material.html': 'Gestión de Materiales',
        'material.html': 'Gestión de Materiales',
        'Inventario.html': 'Inventario',
        'inventario.html': 'Inventario',
        'Informe.html': 'Informes',
        'informe.html': 'Informes'
    };

    // Los archivos ahora están en la raíz de static
    const headerPath = 'components/header.html';

    function getModuleName(file) {
        return moduleNames[(file || '').toLowerCase()] || 'Módulo';
    }

    let moduleName = getModuleName(currentFile);

    const HEADER_CACHE_KEY = 'renacer.headerHtml.v1';
    const HEADER_CACHE_VERSION = '2';

    function renderHeaderHtml(html, persist = true) {
        headerContainer.innerHTML = html;

        // Actualizar el nombre del módulo
        const moduleTitle = document.getElementById('module-title');
        if (moduleTitle) moduleTitle.textContent = moduleName;

        // Cargar datos del perfil desde sessionStorage
        const datosGuardados = sessionStorage.getItem('perfilUsuario');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            const nombreCompleto = `${datos.nombres} ${datos.apellidos}`;
            const userNameHeader = document.querySelector('.user-name');
            if (userNameHeader) userNameHeader.textContent = nombreCompleto;
            const userRoleHeader = document.querySelector('.user-role');
            if (userRoleHeader && datos.rol) userRoleHeader.textContent = datos.rol;
        } else {
            // Sembrar datos mínimos para que Inicio muestre "Buen día, <nombre>" aunque no se haya abierto Perfil
            const userNameHeader = document.querySelector('.user-name');
            const userRoleHeader = document.querySelector('.user-role');
            if (userNameHeader) {
                try {
                    sessionStorage.setItem('perfilUsuario', JSON.stringify({
                        nombres: (userNameHeader.textContent || '').trim() || 'Usuario',
                        apellidos: '',
                        rol: (userRoleHeader ? (userRoleHeader.textContent || '').trim() : '') || ''
                    }));
                } catch (_) {}
            }
        }

        // Hook botón modo daltónico
        const btnDaltonico = document.getElementById('btnDaltonico');
        if (btnDaltonico) {
            syncDaltonicoButton(btnDaltonico);
            btnDaltonico.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                toggleDaltonico();
            });
        }

        // Notificar a scripts que dependen del header (ej. perfil-dropdown)
        window.dispatchEvent(new CustomEvent('renacer:headerLoaded', { detail: { moduleName } }));

        if (persist) {
            try {
                sessionStorage.setItem(HEADER_CACHE_KEY, html);
                sessionStorage.setItem(`${HEADER_CACHE_KEY}.ver`, HEADER_CACHE_VERSION);
            } catch (_) {}
        }
    }

    // SPA: asegurar que el header no "desaparezca" al volver a Inicio (o al restaurar páginas)
    function ensureHeaderPresent() {
        try {
            const hasHeader = headerContainer.querySelector('.header');
            const hasUser = headerContainer.querySelector('.user-details');
            const hasDaltonico = headerContainer.querySelector('#btnDaltonico');

            if (hasHeader && hasUser && hasDaltonico) {
                const btn = document.getElementById('btnDaltonico');
                if (btn) syncDaltonicoButton(btn);

                const datosGuardados = sessionStorage.getItem('perfilUsuario');
                if (datosGuardados) {
                    const datos = JSON.parse(datosGuardados);
                    const nombreCompleto = `${datos.nombres} ${datos.apellidos}`;
                    const userNameHeader = document.querySelector('.user-name');
                    if (userNameHeader) userNameHeader.textContent = nombreCompleto;
                    const userRoleHeader = document.querySelector('.user-role');
                    if (userRoleHeader && datos.rol) userRoleHeader.textContent = datos.rol;
                }
                return;
            }

            const ver = sessionStorage.getItem(`${HEADER_CACHE_KEY}.ver`);
            const cached = sessionStorage.getItem(HEADER_CACHE_KEY);
            if (ver === HEADER_CACHE_VERSION && cached && cached.includes('id="btnDaltonico"') && cached.includes('class="user-details"')) {
                renderHeaderHtml(cached, false);
                return;
            }
        } catch (_) {}

        fetch(headerPath, { cache: 'no-store' })
            .then(r => r.ok ? r.text() : '')
            .then(html => {
                const h = (html || '').trim();
                if (!h) return;
                renderHeaderHtml(h, true);
            })
            .catch(() => {});
    }

    // Render instantáneo desde caché (si existe)
    try {
        const ver = sessionStorage.getItem(`${HEADER_CACHE_KEY}.ver`);
        const cached = sessionStorage.getItem(HEADER_CACHE_KEY);
        if (ver === HEADER_CACHE_VERSION && cached && cached.includes('id="btnDaltonico"') && cached.includes('class="user-details"')) {
            renderHeaderHtml(cached, false);
        }
    } catch (_) {}

    // Cargar el HTML del encabezado (fetch) y refrescar caché
    fetch(headerPath, { cache: 'force-cache' })
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el encabezado: ' + response.statusText);
            return response.text();
        })
        .then(html => {
            const h = (html || '').trim();
            if (!h) return;
            renderHeaderHtml(h, true);
            log('✅ Encabezado cargado:', moduleName);
        })
        .catch(error => {
            log("⚠️ No se pudo cargar el encabezado:", error);
        });

    // Si navegamos vía SPA, actualizar título/estado sin recargar
    window.addEventListener('renacer:navigated', (e) => {
        const file = (e.detail && e.detail.file) ? e.detail.file : getCurrentFile();
        currentFile = (file || '').toLowerCase();
        document.body.dataset.page = currentFile;
        moduleName = getModuleName(currentFile);
        const moduleTitle = document.getElementById('module-title');
        if (moduleTitle) moduleTitle.textContent = moduleName;
        ensureDaltonicoCssLast();
        window.dispatchEvent(new CustomEvent('renacer:headerLoaded', { detail: { moduleName } }));
        ensureHeaderPresent();
    });

    window.addEventListener('renacer:ensureHeader', ensureHeaderPresent);
});

// Escuchar cambios en el perfil para actualizar el header
window.addEventListener('perfilActualizado', (e) => {
    const datos = e.detail;
    const nombreCompleto = `${datos.nombres} ${datos.apellidos}`;
    const userNameHeader = document.querySelector('.user-name');
    if (userNameHeader) {
        userNameHeader.textContent = nombreCompleto;
    }
});

