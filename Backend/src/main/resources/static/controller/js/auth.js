// Configuración de autenticación
const AUTH_CONFIG = {
    apiBaseURL: '/api/auth'
};

/**
 * Autentica un usuario con el servidor
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function authenticate(username, password) {
    try {
        const credentials = btoa(`${username}:${password}`);
        
        const response = await fetch(`${AUTH_CONFIG.apiBaseURL}/check`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'omit' // Previene el diálogo nativo del navegador
        });

        if (response.ok) {
            // Guardar credenciales para uso futuro
            saveCredentials(username, password);
            return { success: true };
        } else if (response.status === 401) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        } else {
            return { success: false, error: 'Error al conectar con el servidor (Error ' + response.status + ')' };
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        return { success: false, error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' };
    }
}

/**
 * Guarda las credenciales en localStorage
 */
function saveCredentials(username, password) {
    if (typeof(Storage) !== "undefined") {
        // Guardar con ambas claves para compatibilidad
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('renacer_username', username); // Mantener por compatibilidad
        localStorage.setItem('renacer_password', password); // Mantener por compatibilidad
    }
}

/**
 * Obtiene las credenciales guardadas de localStorage
 */
function getSavedCredentials() {
    if (typeof(Storage) !== "undefined") {
        // Intentar obtener con las claves nuevas primero, luego las antiguas
        return {
            username: localStorage.getItem('username') || localStorage.getItem('renacer_username') || '',
            password: localStorage.getItem('password') || localStorage.getItem('renacer_password') || ''
        };
    }
    return { username: '', password: '' };
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    
    if (loginForm) {
        // Manejar el envío del formulario
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el envío normal del formulario
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (!usernameInput || !passwordInput) {
                console.error('No se encontraron los campos de usuario y contraseña');
                return;
            }
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (!username || !password) {
                showError('Por favor ingresa usuario y contraseña');
                return;
            }
            
            // Deshabilitar el botón durante la autenticación
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : '';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Iniciando sesión...';
            }
            
            // Ocultar errores anteriores
            hideError();
            
            // Intentar autenticar
            const result = await authenticate(username, password);
            
            if (result.success) {
                // Redirigir a inicio.html después de autenticación exitosa
                window.location.href = 'inicio.html';
            } else {
                // Mostrar error
                showError(result.error || 'Error al iniciar sesión');
                
                // Restaurar el botón
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            }
        });
        
        // Cargar credenciales guardadas si existen
        const savedCredentials = getSavedCredentials();
        if (savedCredentials.username && usernameInput) {
            usernameInput.value = savedCredentials.username;
        }
        if (savedCredentials.password && passwordInput) {
            passwordInput.value = savedCredentials.password;
        }
    }
});

/**
 * Muestra un mensaje de error
 */
function showError(message) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        // Si no existe el div de error, crear una alerta temporal
        alert(message);
    }
}

/**
 * Oculta el mensaje de error
 */
function hideError() {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

