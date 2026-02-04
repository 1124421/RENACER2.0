// Script ligero: redirige cualquier control del dashboard que diga "Nuevo asociado"
// hacia asociado.html?openNew=1 (la página de asociados se encargará de abrir el modal).
document.addEventListener('DOMContentLoaded', () => {
  const TARGET_TEXT = 'nuevo asociado';
  const redirectToAsociados = () => {
    window.location.href = 'asociado.html?openNew=1';
  };

  // Busca elementos de uso frecuente (cartas, botones, enlaces) y los que tengan onclick apuntando al modal
  const candidates = Array.from(document.querySelectorAll('button, a, .card, .card-content, .btn, .btn-new'));
  candidates.forEach(el => {
    const txt = (el.textContent || '').trim().toLowerCase();
    if (txt.includes(TARGET_TEXT)) {
      el.addEventListener('click', (ev) => { ev.preventDefault(); redirectToAsociados(); });
    }
  });

  // También capturar elementos que usan inline onclick con referencia al modal (ej: openModal('asociadoModal'))
  document.querySelectorAll('[onclick]').forEach(el => {
    const onclick = (el.getAttribute('onclick') || '').toLowerCase();
    if (onclick.includes('asociadomodal') || onclick.includes('openmodal') && onclick.includes('asociado')) {
      el.addEventListener('click', (ev) => { ev.preventDefault(); redirectToAsociados(); });
    }
  });
});