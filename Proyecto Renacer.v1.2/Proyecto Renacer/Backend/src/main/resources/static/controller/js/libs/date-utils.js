/**
 * Utilidades para formatear fechas en hora colombiana (America/Bogota)
 */

/**
 * Formatea una fecha a hora colombiana
 * @param {Date|string} fecha - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
function formatFechaColombiana(fecha, options = {}) {
    if (!fecha) return 'N/A';
    
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    
    if (isNaN(fechaObj.getTime())) return 'N/A';
    
    // Opciones por defecto
    const defaultOptions = {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    // Combinar opciones
    const finalOptions = { ...defaultOptions, ...options };
    
    return fechaObj.toLocaleString('es-CO', finalOptions);
}

/**
 * Obtiene la fecha y hora actual en hora colombiana
 * @returns {Date} Fecha actual en hora colombiana
 */
function getFechaActualColombiana() {
    const ahora = new Date();
    // Convertir a hora colombiana (UTC-5)
    const offsetColombia = -5 * 60; // -5 horas en minutos
    const utc = ahora.getTime() + (ahora.getTimezoneOffset() * 60000);
    return new Date(utc + (offsetColombia * 60000));
}

/**
 * Formatea una fecha solo con día/mes/año en hora colombiana
 */
function formatFechaCorta(fecha) {
    return formatFechaColombiana(fecha, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formatea una fecha con hora completa en hora colombiana
 */
function formatFechaCompleta(fecha) {
    return formatFechaColombiana(fecha, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// Exportar funciones globalmente
window.formatFechaColombiana = formatFechaColombiana;
window.getFechaActualColombiana = getFechaActualColombiana;
window.formatFechaCorta = formatFechaCorta;
window.formatFechaCompleta = formatFechaCompleta;


