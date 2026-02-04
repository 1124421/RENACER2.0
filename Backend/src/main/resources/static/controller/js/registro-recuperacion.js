/**
 * ============================================
 * REGISTRO Y RECUPERACIÓN DE CONTRASEÑA
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del modal de crear cuenta
    const crearCuentaModal = document.getElementById('crear-cuenta-modal');
    const crearCuentaForm = document.getElementById('crear-cuenta-form');
    const linkCrearCuenta = document.getElementById('link-crear-cuenta');

    // Elementos del modal de recuperar contraseña
    const recuperarModal = document.getElementById('recuperar-contrasena-modal');
    const linkRecuperar = document.getElementById('link-recuperar-contrasena');
    const paso1Recuperar = document.getElementById('paso-1-recuperar');
    const paso2Recuperar = document.getElementById('paso-2-recuperar');
    const paso3Recuperar = document.getElementById('paso-3-recuperar');
    const recuperarUsuarioForm = document.getElementById('recuperar-usuario-form');
    const recuperarRespuestaForm = document.getElementById('recuperar-respuesta-form');
    const recuperarCambiarContrasenaForm = document.getElementById('recuperar-cambiar-contrasena-form');

    // Variables para almacenar datos durante el proceso de recuperación
    let usuarioRecuperar = '';

    // Abrir modal de crear cuenta
    if (linkCrearCuenta) {
        linkCrearCuenta.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModales();
            if (crearCuentaModal) {
                crearCuentaModal.style.display = 'flex';
            }
        });
    }

    // Abrir modal de recuperar contraseña
    if (linkRecuperar) {
        linkRecuperar.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModales();
            if (recuperarModal) {
                recuperarModal.style.display = 'flex';
                resetearRecuperacion();
            }
        });
    }

    // Volver al login desde crear cuenta
    const linkVolverLoginCrear = document.getElementById('link-volver-login-crear');
    if (linkVolverLoginCrear) {
        linkVolverLoginCrear.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModales();
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    }

    // Volver al login desde recuperar
    const linkVolverLoginRecuperar = document.getElementById('link-volver-login-recuperar');
    if (linkVolverLoginRecuperar) {
        linkVolverLoginRecuperar.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModales();
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    }

    // Formulario de crear cuenta
    if (crearCuentaForm) {
        crearCuentaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
            const username = document.getElementById('usernameRegistro').value.trim();
            const password = document.getElementById('passwordRegistro').value;
            const preguntaSecreta = document.getElementById('preguntaSecreta').value.trim();
            const respuestaSecreta = document.getElementById('respuestaSecreta').value.trim();
            const errorDiv = document.getElementById('registro-error');

            // Validaciones
            if (!nombreCompleto || !username || !password || !preguntaSecreta || !respuestaSecreta) {
                mostrarError('registro-error', 'Todos los campos son obligatorios');
                return;
            }

            try {
                const response = await fetch('/api/auth/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nombreCompleto: nombreCompleto,
                        username: username,
                        password: password,
                        preguntaSecreta: preguntaSecreta,
                        respuestaSecreta: respuestaSecreta
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
                    crearCuentaForm.reset();
                    cerrarModales();
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) {
                        loginModal.style.display = 'flex';
                    }
                } else {
                    mostrarError('registro-error', data.message || 'Error al crear la cuenta');
                }
            } catch (error) {
                console.error('Error al crear cuenta:', error);
                mostrarError('registro-error', 'Error de conexión. Verifica que el servidor esté corriendo.');
            }
        });
    }

    // Paso 1: Obtener pregunta secreta
    if (recuperarUsuarioForm) {
        recuperarUsuarioForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            usuarioRecuperar = document.getElementById('usernameRecuperar').value.trim();
            const errorDiv = document.getElementById('recuperar-error-1');

            if (!usuarioRecuperar) {
                mostrarError('recuperar-error-1', 'Por favor ingresa un usuario');
                return;
            }

            try {
                const response = await fetch(`/api/auth/recuperar/pregunta/${usuarioRecuperar}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Mostrar pregunta secreta
                    document.getElementById('pregunta-secreta-mostrar').textContent = data.preguntaSecreta;
                    paso1Recuperar.style.display = 'none';
                    paso2Recuperar.style.display = 'block';
                    ocultarError('recuperar-error-1');
                } else {
                    mostrarError('recuperar-error-1', data.message || 'Usuario no encontrado');
                }
            } catch (error) {
                console.error('Error al obtener pregunta secreta:', error);
                mostrarError('recuperar-error-1', 'Error de conexión. Verifica que el servidor esté corriendo.');
            }
        });
    }

    // Paso 2: Validar respuesta secreta
    if (recuperarRespuestaForm) {
        recuperarRespuestaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const respuestaSecreta = document.getElementById('respuestaSecretaRecuperar').value.trim();
            const errorDiv = document.getElementById('recuperar-error-2');

            if (!respuestaSecreta) {
                mostrarError('recuperar-error-2', 'Por favor ingresa la respuesta secreta');
                return;
            }

            try {
                const response = await fetch('/api/auth/recuperar/validar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: usuarioRecuperar,
                        respuestaSecreta: respuestaSecreta
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Guardar respuesta secreta para el siguiente paso
                    sessionStorage.setItem('respuestaSecretaTemp', respuestaSecreta);
                    paso2Recuperar.style.display = 'none';
                    paso3Recuperar.style.display = 'block';
                    ocultarError('recuperar-error-2');
                } else {
                    mostrarError('recuperar-error-2', data.message || 'Respuesta secreta incorrecta');
                }
            } catch (error) {
                console.error('Error al validar respuesta secreta:', error);
                mostrarError('recuperar-error-2', 'Error de conexión. Verifica que el servidor esté corriendo.');
            }
        });
    }

    // Paso 3: Cambiar contraseña
    if (recuperarCambiarContrasenaForm) {
        recuperarCambiarContrasenaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nuevaContrasena = document.getElementById('nuevaContrasenaRecuperar').value;
            const confirmarContrasena = document.getElementById('confirmarContrasenaRecuperar').value;
            const errorDiv = document.getElementById('recuperar-error-3');

            if (!nuevaContrasena || !confirmarContrasena) {
                mostrarError('recuperar-error-3', 'Por favor completa todos los campos');
                return;
            }

            if (nuevaContrasena !== confirmarContrasena) {
                mostrarError('recuperar-error-3', 'Las contraseñas no coinciden');
                return;
            }

            const respuestaSecreta = sessionStorage.getItem('respuestaSecretaTemp');

            try {
                const response = await fetch('/api/auth/recuperar/cambiar-contrasena', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: usuarioRecuperar,
                        nuevaContrasena: nuevaContrasena,
                        respuestaSecreta: respuestaSecreta
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.');
                    sessionStorage.removeItem('respuestaSecretaTemp');
                    cerrarModales();
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) {
                        loginModal.style.display = 'flex';
                    }
                } else {
                    mostrarError('recuperar-error-3', data.message || 'Error al cambiar la contraseña');
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                mostrarError('recuperar-error-3', 'Error de conexión. Verifica que el servidor esté corriendo.');
            }
        });
    }

    // Funciones auxiliares
    function cerrarModales() {
        const modales = document.querySelectorAll('.modal-login');
        modales.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    function resetearRecuperacion() {
        paso1Recuperar.style.display = 'block';
        paso2Recuperar.style.display = 'none';
        paso3Recuperar.style.display = 'none';
        if (recuperarUsuarioForm) recuperarUsuarioForm.reset();
        if (recuperarRespuestaForm) recuperarRespuestaForm.reset();
        if (recuperarCambiarContrasenaForm) recuperarCambiarContrasenaForm.reset();
        usuarioRecuperar = '';
        sessionStorage.removeItem('respuestaSecretaTemp');
        ocultarError('recuperar-error-1');
        ocultarError('recuperar-error-2');
        ocultarError('recuperar-error-3');
    }

    function mostrarError(elementId, mensaje) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
    }

    function ocultarError(elementId) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // Cerrar modales al hacer click fuera
    window.addEventListener('click', function(event) {
        const modales = document.querySelectorAll('.modal-login');
        modales.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});


