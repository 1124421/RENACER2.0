// ==========================================
// ARCHIVO: controller/js/perfil-dropdown.js
// ==========================================

let perfilDropdownInitialized = false;

function initPerfilDropdown() {
  if (perfilDropdownInitialized) return;
  
  const userInfo = document.querySelector('.user-info');
  if (!userInfo) return;

  // Verificar si ya existe el dropdown
  if (document.querySelector('.perfil-dropdown')) return;

  perfilDropdownInitialized = true;

  // Obtener datos del perfil de sessionStorage
  const datosGuardados = sessionStorage.getItem('perfilUsuario');
  let nombre = 'Brandon Leal';
  let correo = 'brandon.leal@planetapp.com';
  let telefono = '+57 300 123 4567';
  
  if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);
    nombre = `${datos.nombres} ${datos.apellidos}`;
    correo = datos.correo;
    telefono = datos.telefono;
  }

  // Crear el overlay
  const overlay = document.createElement('div');
  overlay.className = 'perfil-overlay';
  document.body.appendChild(overlay);

  // Crear el dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'perfil-dropdown';
  dropdown.innerHTML = `
    <div class="perfil-header">
      <div class="perfil-avatar">
        <i class="fas fa-user"></i>
      </div>
    </div>
    <div class="perfil-info">
      <div class="perfil-nombre">${nombre}</div>
      <div class="perfil-cargo">Administrador</div>
      <div class="perfil-datos">
        <div class="perfil-dato-item">
          <i class="fas fa-envelope"></i>
          <span class="perfil-correo">${correo}</span>
        </div>
        <div class="perfil-dato-item">
          <i class="fas fa-phone"></i>
          <span class="perfil-telefono">${telefono}</span>
        </div>
      </div>
    </div>
    <div class="perfil-menu">
      <div class="perfil-menu-item" id="btnPerfil">
        <div class="menu-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2d5a47" width="20" height="20">
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
          </svg>
        </div>
        <span>Editar perfil</span>
        <i class="fas fa-chevron-right arrow-icon"></i>
      </div>
    </div>
  `;

  document.body.appendChild(dropdown);

  // Toggle dropdown
  userInfo.addEventListener('click', (e) => {
    // No abrir el perfil si el click fue en el botón de accesibilidad (modo daltónico)
    if (e.target && e.target.closest && e.target.closest('#btnDaltonico')) return;
    e.stopPropagation();
    dropdown.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  // Cerrar al hacer click en el overlay
  overlay.addEventListener('click', () => {
    dropdown.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Prevenir que el dropdown se cierre al hacer click dentro
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Ir a perfil
  dropdown.querySelector('#btnPerfil').addEventListener('click', () => {
    window.location.href = 'perfil.html';
  });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerfilDropdown);
} else {
  initPerfilDropdown();
}

// Ejecutar justo después de que se cargue el header (más rápido que setTimeout)
window.addEventListener('renacer:headerLoaded', initPerfilDropdown);

// Escuchar cambios en el perfil
window.addEventListener('perfilActualizado', (e) => {
  const datos = e.detail;
  const nombre = `${datos.nombres} ${datos.apellidos}`;
  
  // Actualizar dropdown si existe
  const perfilNombre = document.querySelector('.perfil-dropdown .perfil-nombre');
  const perfilCorreo = document.querySelector('.perfil-dropdown .perfil-correo');
  const perfilTelefono = document.querySelector('.perfil-dropdown .perfil-telefono');
  
  if (perfilNombre) perfilNombre.textContent = nombre;
  if (perfilCorreo) perfilCorreo.textContent = datos.correo;
  if (perfilTelefono) perfilTelefono.textContent = datos.telefono;
  
  // Actualizar header
  const userNameHeader = document.querySelector('.user-name');
  if (userNameHeader) userNameHeader.textContent = nombre;
});
