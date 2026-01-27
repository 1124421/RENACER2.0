/**
 * ============================================
 * CONFIGURACIÓN DE USUARIO
 * ============================================
 */

function renacerInitConfiguracion() {
    // Obtener usuario actual desde localStorage
    const credenciales = JSON.parse(localStorage.getItem('credentials') || '{}');
    const username = credenciales.username || localStorage.getItem('username') || '';

    if (!username) {
        alert('No se encontró información de usuario. Por favor, inicie sesión nuevamente.');
        window.location.href = 'Index.html';
        return;
    }

    // Cargar pregunta secreta al iniciar
    async function cargarPreguntaSecreta() {
        try {
            const response = await fetch(`/api/auth/recuperar/pregunta/${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const preguntaSecretaElement = document.getElementById('preguntaSecretaMostrar');
                if (preguntaSecretaElement && data.preguntaSecreta) {
                    preguntaSecretaElement.textContent = data.preguntaSecreta;
                } else if (preguntaSecretaElement) {
                    preguntaSecretaElement.textContent = 'No hay pregunta secreta configurada';
                }
            } else {
                const preguntaSecretaElement = document.getElementById('preguntaSecretaMostrar');
                if (preguntaSecretaElement) {
                    preguntaSecretaElement.textContent = 'Error al cargar pregunta secreta';
                }
            }
        } catch (error) {
            console.error('Error al cargar pregunta secreta:', error);
            const preguntaSecretaElement = document.getElementById('preguntaSecretaMostrar');
            if (preguntaSecretaElement) {
                preguntaSecretaElement.textContent = 'Error al cargar pregunta secreta';
            }
        }
    }

    // Cargar pregunta secreta al iniciar
    cargarPreguntaSecreta();

    // Formulario cambiar contraseña
    const formCambiarContrasena = document.getElementById('form-cambiar-contrasena');
    if (formCambiarContrasena) {
        formCambiarContrasena.addEventListener('submit', async function(e) {
            e.preventDefault();

            const respuestaSecreta = document.getElementById('respuestaSecretaContrasena').value.trim();
            const nuevaContrasena = document.getElementById('nuevaContrasena').value;
            const confirmarContrasena = document.getElementById('confirmarContrasena').value;
            const errorDiv = document.getElementById('error-contrasena');
            const successDiv = document.getElementById('success-contrasena');

            // Validaciones
            if (!respuestaSecreta || !nuevaContrasena || !confirmarContrasena) {
                mostrarError('error-contrasena', 'Por favor completa todos los campos');
                return;
            }

            if (nuevaContrasena !== confirmarContrasena) {
                mostrarError('error-contrasena', 'Las contraseñas no coinciden');
                return;
            }

            if (nuevaContrasena.length < 4) {
                mostrarError('error-contrasena', 'La contraseña debe tener al menos 4 caracteres');
                return;
            }

            try {
                // Validar respuesta secreta y cambiar contraseña usando el endpoint de recuperación
                const response = await fetch('/api/auth/recuperar/cambiar-contrasena', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        respuestaSecreta: respuestaSecreta,
                        nuevaContrasena: nuevaContrasena
                    })
                });

                const data = await response.json();

                if (data.success) {
                    ocultarError('error-contrasena');
                    mostrarSuccess('success-contrasena', 'Contraseña actualizada exitosamente');
                    formCambiarContrasena.reset();
                    
                    // Actualizar contraseña en localStorage
                    if (credenciales.password) {
                        credenciales.password = nuevaContrasena;
                        localStorage.setItem('credentials', JSON.stringify(credenciales));
                    }
                    localStorage.setItem('password', nuevaContrasena);
                } else {
                    mostrarError('error-contrasena', data.message || 'Error al cambiar la contraseña');
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                mostrarError('error-contrasena', 'Error de conexión. Verifica que el servidor esté corriendo.');
            }
        });
    }

    // Funciones auxiliares
    function mostrarError(elementId, mensaje) {
        const errorDiv = document.getElementById(elementId);
        const successDiv = elementId.replace('error', 'success');
        const successElement = document.getElementById(successDiv);
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    function mostrarSuccess(elementId, mensaje) {
        const successDiv = document.getElementById(elementId);
        const errorDiv = elementId.replace('success', 'error');
        const errorElement = document.getElementById(errorDiv);
        if (successDiv) {
            successDiv.textContent = mensaje;
            successDiv.style.display = 'block';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            if (successDiv) {
                successDiv.style.display = 'none';
            }
        }, 5000);
    }

    function ocultarError(elementId) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitConfiguracion);
} else {
    renacerInitConfiguracion();
}

