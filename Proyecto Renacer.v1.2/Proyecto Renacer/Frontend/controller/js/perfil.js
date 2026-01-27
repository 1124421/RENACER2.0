// ==========================================
// ARCHIVO: controller/js/perfil.js
// ==========================================

async function renacerInitPerfil() {
  const btnEditarGuardar = document.getElementById('btnEditarGuardar');
  const inputs = document.querySelectorAll('#perfilForm input');
  const primerNombreInput = document.getElementById('primerNombre');
  const segundoNombreInput = document.getElementById('segundoNombre');
  const primerApellidoInput = document.getElementById('primerApellido');
  const segundoApellidoInput = document.getElementById('segundoApellido');
  const documentoInput = document.getElementById('documento');
  const correoInput = document.getElementById('correo');
  const telefonoInput = document.getElementById('telefono');
  const nombreGrande = document.getElementById('nombreCompletoPerfil');
  const rolGrande = document.getElementById('rolPerfil');
  const telefonoPerfil = document.getElementById('telefonoPerfil');
  const correoPerfil = document.getElementById('correoPerfil');
  let modoEdicion = false;

  // Obtener username desde localStorage
  const credenciales = JSON.parse(localStorage.getItem('credentials') || '{}');
  const username = credenciales.username || localStorage.getItem('username') || '';

  if (!username) {
    console.error('No se encontró username');
    return;
  }

  // Cargar datos del usuario desde el backend
  async function cargarDatosUsuario() {
    try {
      const password = credenciales.password || localStorage.getItem('password') || '';
      const credentials = btoa(`${username}:${password}`);

      // Codificar el username para evitar problemas con caracteres especiales
      const usernameEncoded = encodeURIComponent(username);
      const response = await fetch(`/api/auth/perfil/${usernameEncoded}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al cargar perfil: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.usuario) {
        const usuario = data.usuario;
        
        // Dividir nombre completo en partes
        const nombreCompleto = usuario.nombreUsuario || '';
        const apellidoCompleto = usuario.apellido || '';
        const partesNombre = nombreCompleto.split(' ');
        const partesApellido = apellidoCompleto.split(' ');

        // Llenar campos
        primerNombreInput.value = partesNombre[0] || '';
        segundoNombreInput.value = partesNombre.slice(1).join(' ') || '';
        primerApellidoInput.value = partesApellido[0] || '';
        segundoApellidoInput.value = partesApellido.slice(1).join(' ') || '';
        documentoInput.value = usuario.documento || '';
        correoInput.value = usuario.correo || '';
        telefonoInput.value = usuario.telefono || '';

        // Actualizar sección izquierda
        const nombreDisplay = nombreCompleto + (apellidoCompleto ? ' ' + apellidoCompleto : '');
        nombreGrande.textContent = nombreDisplay || 'Usuario';
        rolGrande.textContent = usuario.rol || 'Usuario';
        telefonoPerfil.textContent = usuario.telefono || '-';
        correoPerfil.textContent = usuario.correo || '-';

        // Guardar en sessionStorage para otros componentes
        sessionStorage.setItem('perfilUsuario', JSON.stringify({
          nombres: nombreCompleto,
          apellidos: apellidoCompleto,
          correo: usuario.correo || '',
          telefono: usuario.telefono || ''
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      mostrarError('Error al cargar datos del perfil');
    }
  }

  // Cargar datos al iniciar
  await cargarDatosUsuario();

  btnEditarGuardar.addEventListener('click', async () => {
    if (!modoEdicion) {
      // Cambiar a modo edición
      modoEdicion = true;
      btnEditarGuardar.textContent = 'Guardar';
      btnEditarGuardar.classList.add('guardar');
      
      inputs.forEach(input => {
        input.disabled = false;
      });
    } else {
      // Guardar cambios
      const password = credenciales.password || localStorage.getItem('password') || '';
      const credentials = btoa(`${username}:${password}`);

      // Construir nombre completo y apellido completo
      const nombreCompleto = [primerNombreInput.value.trim(), segundoNombreInput.value.trim()]
        .filter(n => n).join(' ');
      const apellidoCompleto = [primerApellidoInput.value.trim(), segundoApellidoInput.value.trim()]
        .filter(a => a).join(' ');

      try {
        const response = await fetch('/api/auth/actualizar-perfil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          body: JSON.stringify({
            username: username,
            nombreUsuario: nombreCompleto || primerNombreInput.value.trim(),
            apellido: apellidoCompleto || primerApellidoInput.value.trim(),
            documento: documentoInput.value.trim(),
            telefono: telefonoInput.value.trim(),
            correo: correoInput.value.trim()
          })
        });

        const data = await response.json();

        if (data.success) {
          modoEdicion = false;
          btnEditarGuardar.textContent = 'Editar';
          btnEditarGuardar.classList.remove('guardar');
          
          inputs.forEach(input => {
            input.disabled = true;
          });

          // Actualizar sección izquierda
          const nombreDisplay = (nombreCompleto || primerNombreInput.value.trim()) + 
            (apellidoCompleto ? ' ' + apellidoCompleto : '');
          nombreGrande.textContent = nombreDisplay;
          telefonoPerfil.textContent = telefonoInput.value || '-';
          correoPerfil.textContent = correoInput.value || '-';

          // Actualizar sessionStorage
          sessionStorage.setItem('perfilUsuario', JSON.stringify({
            nombres: nombreCompleto || primerNombreInput.value.trim(),
            apellidos: apellidoCompleto || primerApellidoInput.value.trim(),
            correo: correoInput.value || '',
            telefono: telefonoInput.value || ''
          }));

          // Disparar evento para actualizar otros componentes
          window.dispatchEvent(new CustomEvent('perfilActualizado', { 
            detail: {
              nombres: nombreCompleto || primerNombreInput.value.trim(),
              apellidos: apellidoCompleto || primerApellidoInput.value.trim(),
              correo: correoInput.value || '',
              telefono: telefonoInput.value || ''
            }
          }));

          mostrarSuccess('Perfil actualizado correctamente');
        } else {
          mostrarError(data.message || 'Error al actualizar el perfil');
        }
      } catch (error) {
        console.error('Error al guardar perfil:', error);
        mostrarError('Error de conexión. Verifica que el servidor esté corriendo.');
      }
    }
  });

  function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-perfil');
    const successDiv = document.getElementById('success-perfil');
    if (errorDiv) {
      errorDiv.textContent = mensaje;
      errorDiv.style.display = 'block';
    }
    if (successDiv) {
      successDiv.style.display = 'none';
    }
  }

  function mostrarSuccess(mensaje) {
    const errorDiv = document.getElementById('error-perfil');
    const successDiv = document.getElementById('success-perfil');
    if (successDiv) {
      successDiv.textContent = mensaje;
      successDiv.style.display = 'block';
    }
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
    setTimeout(() => {
      if (successDiv) {
        successDiv.style.display = 'none';
      }
    }, 5000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renacerInitPerfil);
} else {
  renacerInitPerfil();
}
