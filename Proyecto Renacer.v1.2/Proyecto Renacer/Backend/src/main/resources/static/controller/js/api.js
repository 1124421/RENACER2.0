/**
 * ============================================
 * MÓDULO API COMÚN
 * Maneja todas las peticiones HTTP al backend
 * ============================================
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Obtiene las credenciales almacenadas en localStorage
 */
function getCredentials() {
    return {
        username: localStorage.getItem('username'),
        password: localStorage.getItem('password')
    };
}

/**
 * Crea el header de autenticación Basic
 */
function getAuthHeaders() {
    const { username, password } = getCredentials();
    if (!username || !password) {
        throw new Error('No hay credenciales almacenadas. Por favor, inicia sesión.');
    }
    const credentials = btoa(`${username}:${password}`);
    return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
}

/**
 * Realiza una petición HTTP al backend
 * @param {string} endpoint - Endpoint de la API (ej: '/asociados')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} body - Cuerpo de la petición (para POST/PUT)
 * @returns {Promise} Respuesta de la API
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Obtener headers de autenticación, pero manejar el error si no hay credenciales
    let headers;
    try {
        headers = getAuthHeaders();
    } catch (error) {
        // Si no hay credenciales, lanzar error para que sea manejado por el catch
        throw new Error(error.message || 'No hay credenciales almacenadas. Por favor, inicia sesión.');
    }
    
    const options = {
        method,
        headers: headers,
        credentials: 'omit'
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        // Si no hay contenido, devolver null
        const contentType = response.headers.get('content-type');
        const data = contentType && contentType.includes('application/json') 
            ? await response.json() 
            : null;

        if (!response.ok) {
            // Manejar errores específicos
            if (response.status === 401) {
                // No autorizado - limpiar credenciales pero NO redirigir automáticamente
                // Dejar que el código que llama maneje la redirección si es necesario
                const error = new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
                error.status = 401;
                throw error;
            }
            if (response.status === 409) {
                throw new Error(data?.message || 'El registro ya existe');
            }
            if (response.status === 400) {
                throw new Error(data?.message || 'Datos inválidos');
            }
            if (response.status === 404) {
                throw new Error('Recurso no encontrado');
            }
            throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error(`Error en petición ${method} ${endpoint}:`, error);
        throw error;
    }
}

/**
 * ============================================
 * API DE ASOCIADOS
 * ============================================
 */
const AsociadoAPI = {
    /**
     * Obtener todos los asociados
     */
    getAll: async () => {
        return await apiRequest('/asociados');
    },

    /**
     * Obtener un asociado por ID
     */
    getById: async (id) => {
        return await apiRequest(`/asociados/${id}`);
    },

    /**
     * Crear un nuevo asociado
     */
    create: async (asociado) => {
        return await apiRequest('/asociados', 'POST', asociado);
    },

    /**
     * Actualizar un asociado
     */
    update: async (id, asociado) => {
        return await apiRequest(`/asociados/${id}`, 'PUT', asociado);
    },

    /**
     * Eliminar un asociado
     */
    delete: async (id) => {
        return await apiRequest(`/asociados/${id}`, 'DELETE');
    }
};

/**
 * ============================================
 * API DE MATERIALES
 * ============================================
 */
const MaterialAPI = {
    /**
     * Obtener todos los materiales
     */
    getAll: async () => {
        return await apiRequest('/materiales');
    },

    /**
     * Obtener un material por ID
     */
    getById: async (id) => {
        return await apiRequest(`/materiales/${id}`);
    },

    /**
     * Crear un nuevo material
     */
    create: async (material) => {
        return await apiRequest('/materiales', 'POST', material);
    },

    /**
     * Actualizar un material
     */
    update: async (id, material) => {
        return await apiRequest(`/materiales/${id}`, 'PUT', material);
    },

    /**
     * Eliminar un material
     */
    delete: async (id) => {
        return await apiRequest(`/materiales/${id}`, 'DELETE');
    }
};

/**
 * ============================================
 * API DE CATEGORÍAS DE MATERIALES
 * ============================================
 */
const CategoriaMaterialAPI = {
    /**
     * Obtener todas las categorías
     */
    getAll: async () => {
        try {
            const data = await apiRequest('/categorias-material');
            return {
                success: true,
                data: Array.isArray(data) ? data : []
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al obtener categorías',
                data: []
            };
        }
    },

    /**
     * Crear una nueva categoría
     */
    create: async (categoria) => {
        try {
            const data = await apiRequest('/categorias-material', 'POST', categoria);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al crear categoría'
            };
        }
    },

    /**
     * Actualizar una categoría
     */
    update: async (id, categoria) => {
        try {
            const data = await apiRequest(`/categorias-material/${id}`, 'PUT', categoria);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al actualizar categoría'
            };
        }
    },

    /**
     * Eliminar una categoría
     */
    delete: async (id) => {
        try {
            await apiRequest(`/categorias-material/${id}`, 'DELETE');
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al eliminar categoría'
            };
        }
    }
};

/**
 * ============================================
 * API DE NOMBRES DE MATERIALES
 * ============================================
 */
const NombreMaterialAPI = {
    /**
     * Obtener todos los nombres de materiales
     */
    getAll: async () => {
        try {
            const data = await apiRequest('/nombres-material');
            return {
                success: true,
                data: Array.isArray(data) ? data : []
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al obtener nombres de materiales',
                data: []
            };
        }
    },

    /**
     * Crear un nuevo nombre de material
     */
    create: async (nombreMaterial) => {
        try {
            const data = await apiRequest('/nombres-material', 'POST', nombreMaterial);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al crear nombre de material'
            };
        }
    },

    /**
     * Actualizar un nombre de material
     */
    update: async (id, nombreMaterial) => {
        try {
            const data = await apiRequest(`/nombres-material/${id}`, 'PUT', nombreMaterial);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al actualizar nombre de material'
            };
        }
    },

    /**
     * Eliminar un nombre de material
     */
    delete: async (id) => {
        try {
            await apiRequest(`/nombres-material/${id}`, 'DELETE');
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al eliminar nombre de material'
            };
        }
    }
};

/**
 * ============================================
 * API DE INGRESOS (COMPRAS)
 * ============================================
 */
const IngresoAPI = {
    /**
     * Obtener todos los ingresos
     */
    getAll: async () => {
        return await apiRequest('/ingresos');
    },

    /**
     * Obtener un ingreso por ID
     */
    getById: async (id) => {
        return await apiRequest(`/ingresos/${id}`);
    },

    /**
     * Crear un nuevo ingreso (compra)
     */
    create: async (ingreso) => {
        return await apiRequest('/ingresos', 'POST', ingreso);
    },

    /**
     * Actualizar un ingreso
     */
    update: async (id, ingreso) => {
        return await apiRequest(`/ingresos/${id}`, 'PUT', ingreso);
    },

    /**
     * Eliminar un ingreso
     */
    delete: async (id) => {
        return await apiRequest(`/ingresos/${id}`, 'DELETE');
    }
};

/**
 * ============================================
 * API DE EGRESOS (VENTAS)
 * ============================================
 */
const EgresoAPI = {
    /**
     * Obtener todos los egresos
     */
    getAll: async () => {
        return await apiRequest('/egresos');
    },

    /**
     * Obtener un egreso por ID
     */
    getById: async (id) => {
        return await apiRequest(`/egresos/${id}`);
    },

    /**
     * Crear un nuevo egreso (venta)
     */
    create: async (egreso) => {
        return await apiRequest('/egresos', 'POST', egreso);
    },

    /**
     * Actualizar un egreso
     */
    update: async (id, egreso) => {
        return await apiRequest(`/egresos/${id}`, 'PUT', egreso);
    },

    /**
     * Eliminar un egreso
     */
    delete: async (id) => {
        return await apiRequest(`/egresos/${id}`, 'DELETE');
    }
};

/**
 * ============================================
 * API DE BARRIOS
 * ============================================
 */
const BarrioAPI = {
    /**
     * Obtener todos los barrios
     */
    getAll: async () => {
        return await apiRequest('/barrios');
    },
    
    /**
     * Crear un nuevo barrio
     */
    create: async (barrio) => {
        return await apiRequest('/barrios', 'POST', barrio);
    }
};

/**
 * ============================================
 * API DE COMUNAS
 * ============================================
 */
const ComunaAPI = {
    /**
     * Obtener todas las comunas
     */
    getAll: async () => {
        return await apiRequest('/comunas');
    },
    
    /**
     * Crear una nueva comuna
     */
    create: async (comuna) => {
        return await apiRequest('/comunas', 'POST', comuna);
    }
};

/**
 * ============================================
 * API DE BODEGAS
 * ============================================
 */
const BodegaAPI = {
    /**
     * Obtener todas las bodegas
     */
    getAll: async () => {
        return await apiRequest('/bodegas');
    },
    
    /**
     * Crear una nueva bodega
     */
    create: async (bodega) => {
        return await apiRequest('/bodegas', 'POST', bodega);
    }
};

/**
 * ============================================
 * API DE CLIENTES
 * ============================================
 */
const ClienteAPI = {
    /**
     * Obtener todos los clientes
     */
    getAll: async () => {
        return await apiRequest('/clientes');
    },

    /**
     * Crear un nuevo cliente
     */
    create: async (cliente) => {
        return await apiRequest('/clientes', 'POST', cliente);
    }
};

/**
 * ============================================
 * API DE INVENTARIO
 * ============================================
 */
const InventarioAPI = {
    /**
     * Obtener inventario actual
     */
    getAll: async () => {
        return await apiRequest('/inventario');
    }
};

// Exportar el objeto API y función helper
window.API = {
    Asociado: AsociadoAPI,
    Material: MaterialAPI,
    CategoriaMaterial: CategoriaMaterialAPI,
    NombreMaterial: NombreMaterialAPI,
    Ingreso: IngresoAPI,
    Egreso: EgresoAPI,
    Barrio: BarrioAPI,
    Comuna: ComunaAPI,
    Bodega: BodegaAPI,
    Cliente: ClienteAPI,
    Inventario: InventarioAPI
};

// Exportar función helper para obtener headers de autenticación
window.getAuthHeaders = getAuthHeaders;

// Exportar función helper para obtener credenciales
window.getCredentials = getCredentials;

console.log('✅ Módulo API cargado correctamente');

