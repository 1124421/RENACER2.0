// ==========================================
// ARCHIVO: controller/js/spa-router.js
// Navegación tipo SPA (sin recargar página) para links del menú
// ==========================================
(function () {
  'use strict';

  const DEBUG = localStorage.getItem('debugRenacer') === '1';
  const log = (...args) => { if (DEBUG) console.log('[SPA]', ...args); };

  const PAGE_CACHE_PREFIX = 'renacer.pageHtml.v1:';
  const SPA_EXTRAS_ID = 'spa-extras';

  const CORE_SCRIPTS = new Set([
    'controller/js/carga-menu.js',
    'controller/js/carga-header.js',
    'controller/js/perfil-dropdown.js',
    'controller/js/spa-router.js',
  ]);

  function normalizeSrc(src) {
    try {
      const u = new URL(src, window.location.href);
      if (u.origin === window.location.origin) return u.pathname.replace(/^\/+/, '');
      return u.href;
    } catch {
      return src;
    }
  }

  function isCoreScript(src) {
    const s = normalizeSrc(src);
    return CORE_SCRIPTS.has(s);
  }

  function ensureSpaExtras() {
    let el = document.getElementById(SPA_EXTRAS_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = SPA_EXTRAS_ID;
      document.body.appendChild(el);
    }
    return el;
  }

  function findMainContent(root) {
    return (
      root.querySelector('.container .main-content') ||
      root.querySelector('main.main-content') ||
      root.querySelector('.main-content')
    );
  }

  function getFileNameFromHref(href) {
    const cleaned = (href || '').split('#')[0].split('?')[0];
    const parts = cleaned.split('/');
    return (parts[parts.length - 1] || '').toLowerCase();
  }

  function setLoading(on) {
    document.body.classList.toggle('spa-loading', !!on);
  }

  function scrollToTopSmart() {
    try { document.body.style.overflow = ''; } catch {}
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch { try { window.scrollTo(0, 0); } catch {} }
    try {
      const se = document.scrollingElement || document.documentElement;
      if (se) se.scrollTop = 0;
    } catch {}
    try { document.documentElement.scrollTop = 0; } catch {}
    try { document.body.scrollTop = 0; } catch {}
    try {
      const main = findMainContent(document);
      if (main && typeof main.scrollTop === 'number') main.scrollTop = 0;
    } catch {}
    try {
      const c = document.querySelector('.container');
      if (c && typeof c.scrollTop === 'number') c.scrollTop = 0;
    } catch {}
  }

  const dormantPages = new Map(); // file -> { contentFrag, extrasFrag, title }

  function ensureStylesFromDoc(doc) {
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'));
    for (const l of links) {
      const href = l.getAttribute('href');
      if (!href) continue;
      const exists = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      if (exists) continue;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function ensureScriptsFromDoc(doc) {
    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    const toLoad = scripts
      .map(s => s.getAttribute('src'))
      .filter(Boolean)
      .filter(src => !isCoreScript(src))
      .filter(src => !document.querySelector(`script[src="${src}"]`));

    return toLoad.reduce((p, src) => {
      return p.then(() => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
      }));
    }, Promise.resolve());
  }

  function stashCurrentPage(file) {
    if (!file) return;
    window.dispatchEvent(new CustomEvent('renacer:pageWillUnload', { detail: { file } }));
    const currentMain = findMainContent(document);
    if (!currentMain) return;
    const currentHeader = currentMain.querySelector('#header-placeholder');
    if (!currentHeader) return;

    const contentFrag = document.createDocumentFragment();
    while (currentHeader.nextSibling) {
      contentFrag.appendChild(currentHeader.nextSibling);
    }

    const extrasEl = ensureSpaExtras();
    const extrasFrag = document.createDocumentFragment();
    while (extrasEl.firstChild) {
      extrasFrag.appendChild(extrasEl.firstChild);
    }

    dormantPages.set(file, { contentFrag, extrasFrag, title: document.title });
  }

  function restorePage(file, href) {
    const entry = dormantPages.get(file);
    if (!entry) return false;
    dormantPages.delete(file);

    const currentMain = findMainContent(document);
    if (!currentMain) return false;
    const currentHeader = currentMain.querySelector('#header-placeholder');
    if (!currentHeader) return false;

    while (currentHeader.nextSibling) currentHeader.parentNode.removeChild(currentHeader.nextSibling);
    currentHeader.parentNode.appendChild(entry.contentFrag);

    const extrasEl = ensureSpaExtras();
    extrasEl.innerHTML = '';
    extrasEl.appendChild(entry.extrasFrag);

    if (entry.title) document.title = entry.title;
    document.body.dataset.page = file;
    scrollToTopSmart();
    window.dispatchEvent(new CustomEvent('renacer:navigated', { detail: { href, file } }));
    window.dispatchEvent(new CustomEvent('renacer:ensureHeader', { detail: { file } }));
    window.dispatchEvent(new CustomEvent('renacer:pageLoaded', { detail: { href, file, cached: true } }));
    return true;
  }

  function swapInNewDoc(doc, href, file) {
    const currentMain = findMainContent(document);
    const nextMain = findMainContent(doc);
    if (!currentMain || !nextMain) return false;

    const currentHeader = currentMain.querySelector('#header-placeholder');
    const nextHeader = nextMain.querySelector('#header-placeholder');
    if (!currentHeader || !nextHeader) return false;

    while (currentHeader.nextSibling) {
      currentHeader.parentNode.removeChild(currentHeader.nextSibling);
    }

    const frag = document.createDocumentFragment();
    let n = nextHeader.nextSibling;
    while (n) {
      frag.appendChild(document.importNode(n, true));
      n = n.nextSibling;
    }
    currentHeader.parentNode.appendChild(frag);

    const extrasEl = ensureSpaExtras();
    extrasEl.innerHTML = '';
    Array.from(doc.body.children).forEach(child => {
      const tag = (child.tagName || '').toLowerCase();
      if (tag === 'script') return;
      if (child.id === 'menu-placeholder') return;
      if (child.id === SPA_EXTRAS_ID) return;
      if (child.classList && child.classList.contains('container')) return;
      if (child.classList && child.classList.contains('main-content')) return;
      extrasEl.appendChild(document.importNode(child, true));
    });

    try { if (doc.title) document.title = doc.title; } catch {}
    document.body.dataset.page = file;
    scrollToTopSmart();
    window.dispatchEvent(new CustomEvent('renacer:navigated', { detail: { href, file } }));
    window.dispatchEvent(new CustomEvent('renacer:ensureHeader', { detail: { file } }));
    return true;
  }

  async function fetchPageHtml(href) {
    const url = new URL(href, window.location.href);
    const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
    const res = await fetch(path, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  async function navigate(href, { push = true } = {}) {
    if (!href) return;
    const file = getFileNameFromHref(href);
    if (!file || file === 'index.html' || href.startsWith('http') || href.startsWith('//')) {
      window.location.href = href;
      return;
    }

    setLoading(true);
    try {
      const fromFile = getFileNameFromHref(window.location.pathname.split('/').pop());
      if (fromFile && fromFile !== file) {
        stashCurrentPage(fromFile);
      }

      if (restorePage(file, href)) {
        if (push) history.pushState({ href }, '', href);
        return;
      }

      const cacheKey = `${PAGE_CACHE_PREFIX}${file}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const cachedDoc = new DOMParser().parseFromString(cached, 'text/html');
        ensureStylesFromDoc(cachedDoc);
        swapInNewDoc(cachedDoc, href, file);
      }

      const html = await fetchPageHtml(href);
      sessionStorage.setItem(cacheKey, html);

      const doc = new DOMParser().parseFromString(html, 'text/html');
      ensureStylesFromDoc(doc);
      const ok = swapInNewDoc(doc, href, file);
      if (!ok) {
        window.location.href = href;
        return;
      }
      await ensureScriptsFromDoc(doc);
      window.dispatchEvent(new CustomEvent('renacer:pageLoaded', { detail: { href, file, cached: false } }));

      if (push) {
        history.pushState({ href }, '', href);
      }
      log('navigated ->', href);
    } catch (e) {
      log('navigate error', e);
      window.location.href = href;
    } finally {
      setLoading(false);
    }
  }

  function onLinkClick(e) {
    const a = e.target && e.target.closest ? e.target.closest('a[data-menu-link]') : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    navigate(href, { push: true });
  }

  function init() {
    if (window.RenacerSPA && window.RenacerSPA.__inited) return;
    // Evitar que el navegador "restaure" scroll automáticamente en back/forward (causa sensación de que el header desaparece)
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch {}
    document.addEventListener('click', onLinkClick);
    window.addEventListener('popstate', (e) => {
      const href = (e.state && e.state.href) ? e.state.href : window.location.pathname.split('/').pop();
      if (href) navigate(href, { push: false });
    });
    window.RenacerSPA = {
      __inited: true,
      navigate,
    };
    log('initialized');

    const initialFile = getFileNameFromHref(window.location.pathname.split('/').pop());
    if (initialFile) {
      document.body.dataset.page = initialFile;
      window.dispatchEvent(new CustomEvent('renacer:pageLoaded', { detail: { href: initialFile, file: initialFile, cached: false } }));
    }
  }

  window.RenacerSPAInit = init;
})();


