/**
 * ==========================================
 * ARCHIVO: controller/js/script-informes.js
 * Gestión de informes con conexión al backend
 * ==========================================
 */

async function renacerInitInformes() {
    const tbody = document.querySelector('.table-container tbody');
    const tipoRegistroSelect = document.getElementById('tipoRegistro');
    const fechaDesdeInput = document.getElementById('fechaDesde');
    const fechaHastaInput = document.getElementById('fechaHasta');
    const estadoSelect = document.getElementById('estado');
    const btnClear = document.getElementById('btn-clear');
    const btnApply = document.getElementById('btn-apply');
    const btnExport = document.getElementById('btn-export');
    
    let informes = [];
    let informesFiltrados = [];

    // Verificar que la API esté cargada
    if (typeof window.API === 'undefined') {
        console.error('❌ API module no está cargado');
        return;
    }

    /**
     * Cargar informes desde el backend
     */
    async function cargarInformes() {
        try {
            console.log('🔄 Cargando informes del backend...');
            
            const [ingresosResponse, egresosResponse] = await Promise.all([
                window.API.Ingreso.getAll().catch(() => ({ success: false, data: [] })),
                window.API.Egreso.getAll().catch(() => ({ success: false, data: [] }))
            ]);

            informes = [];

            // Extraer arrays de las respuestas
            const ingresos = (ingresosResponse && ingresosResponse.success) ? (ingresosResponse.data || []) : (Array.isArray(ingresosResponse) ? ingresosResponse : []);
            const egresos = (egresosResponse && egresosResponse.success) ? (egresosResponse.data || []) : (Array.isArray(egresosResponse) ? egresosResponse : []);

            // Convertir ingresos a formato de informe (mostrando todos los datos del asociado y compra)
            if (Array.isArray(ingresos)) {
                ingresos.forEach(ingreso => {
                if (ingreso.detalles && ingreso.detalles.length > 0) {
                    ingreso.detalles.forEach(detalle => {
                        informes.push({
                            id: ingreso.idIngreso,
                            fecha: new Date(ingreso.fecha).toLocaleString('es-CO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            fechaRaw: ingreso.fecha,
                            // Datos completos del asociado
                            asociadoNombre: ingreso.asociado?.nombre || '-',
                            asociadoApellido: ingreso.asociado?.apellido || '-',
                            asociado: ingreso.asociado ? `${ingreso.asociado.nombre || ''} ${ingreso.asociado.apellido || ''}`.trim() : '-',
                            documento: ingreso.asociado?.documento || '-',
                            telefono: ingreso.asociado?.telefono || '-',
                            correo: ingreso.asociado?.correo || '-',
                            tipoAsociado: ingreso.asociado?.tipo || '-',
                            carreta: ingreso.asociado?.carreta || '-',
                            // Datos de la compra
                            ruta: ingreso.barrio?.nombre || '-',
                            material: detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || '-',
                            cantidadKg: parseFloat(detalle.cantidad) || 0,
                            precioPorKg: parseFloat(detalle.precioPorKg) || 0,
                            precioTotal: parseFloat(detalle.precioPorKg || 0) * parseFloat(detalle.cantidad || 0),
                            totalCompra: parseFloat(ingreso.totalPagado) || 0,
                            bodega: detalle.bodegaDestino?.nombre || '-',
                            rechazado: 0,
                            tipoRegistro: 'compra',
                            tipo: 'compra'
                        });
                    });
                }
                });
            }

            // Convertir egresos a formato de informe (mostrando todos los datos del cliente y venta)
            if (Array.isArray(egresos)) {
                egresos.forEach(egreso => {
                if (egreso.detalles && egreso.detalles.length > 0) {
                    egreso.detalles.forEach(detalle => {
                        // Formatear fecha con hora completa
                        const fechaCompleta = egreso.fecha ? new Date(egreso.fecha) : new Date();
                        const fechaFormateada = fechaCompleta.toLocaleString('es-CO', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        });
                        
                        informes.push({
                            id: egreso.idEgreso,
                            fecha: fechaFormateada,
                            fechaRaw: egreso.fecha || fechaCompleta.toISOString(),
                            // Datos completos del cliente
                            asociadoNombre: egreso.cliente?.nombreEmpresa || '-',
                            asociadoApellido: '-',
                            asociado: egreso.cliente?.nombreEmpresa || '-',
                            documento: egreso.cliente?.documento || '-',
                            telefono: egreso.cliente?.telefono || '-',
                            correo: egreso.cliente?.correo || '-',
                            tipoAsociado: '-',
                            carreta: '-',
                            // Datos de la venta
                            ruta: '-',
                            material: detalle.material?.nombreMaterial?.nombre || detalle.material?.nombre || '-',
                            cantidadKg: parseFloat(detalle.cantidad) || 0,
                            precioPorKg: parseFloat(detalle.precioKgVenta) || 0,
                            precioTotal: parseFloat(detalle.precioKgVenta || 0) * parseFloat(detalle.cantidad || 0),
                            totalCompra: parseFloat(egreso.totalVenta) || 0,
                            bodega: detalle.bodegaOrigen?.nombre || '-',
                            rechazado: 0,
                            tipoRegistro: 'venta',
                            tipo: 'venta'
                        });
                    });
                }
                });
            }

            // Ordenar por fecha (más reciente primero)
            informes.sort((a, b) => new Date(b.fechaRaw) - new Date(a.fechaRaw));

            informesFiltrados = [...informes];
            renderizarInformes();
            
            console.log('✅ Informes cargados:', informes.length);
        } catch (error) {
            console.error('❌ Error al cargar informes:', error);
            showError('Error al cargar los informes');
        }
    }

    /**
     * Renderizar tabla de informes
     */
    function renderizarInformes(filtrados = null) {
        const datos = filtrados || informesFiltrados;
        
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 40px; color: #999;">No hay informes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = datos.map((inf, index) => `
            <tr>
                <td>${inf.id || index + 1}</td>
                <td>${inf.fecha || '-'}</td>
                <td>${inf.asociado || '-'}</td>
                <td>${inf.documento || '-'}</td>
                <td>${inf.carreta || '-'}</td>
                <td>${inf.ruta || '-'}</td>
                <td>${inf.material || '-'}</td>
                <td>${(inf.cantidadKg || 0).toFixed(2)} Kg</td>
                <td>$${(inf.precioTotal || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}</td>
                <td>${(inf.rechazado || 0).toFixed(2)} Kg</td>
                <td>${inf.tipoAsociado || '-'}</td>
                <td class="actions">
                    <button class="download" data-index="${index}" data-tipo="${inf.tipo}" data-id="${inf.idOriginal || inf.id}" title="Descargar">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/></svg>
                    </button>
                    <button class="action-btn edit" data-index="${index}" data-tipo="${inf.tipo}" data-id="${inf.idOriginal || inf.id}" title="Editar">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                    </button>
                    <button class="action-btn delete" data-index="${index}" data-tipo="${inf.tipo}" data-id="${inf.idOriginal || inf.id}" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Agregar event listeners a los botones
        tbody.querySelectorAll('.download').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const tipo = btn.getAttribute('data-tipo');
                descargarInforme(id, tipo);
            });
        });
        
        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const tipo = btn.getAttribute('data-tipo');
                editarInforme(id, tipo);
            });
        });
        
        tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const tipo = btn.getAttribute('data-tipo');
                eliminarInforme(id, tipo);
            });
        });
    }

    /**
     * Aplicar filtros
     */
    function aplicarFiltros() {
        let filtrados = [...informes];

        // Filtro por tipo de registro
        const tipoRegistro = tipoRegistroSelect?.value;
        if (tipoRegistro && tipoRegistro !== 'todos' && tipoRegistro !== '') {
            if (tipoRegistro === 'registro-compras') {
                filtrados = filtrados.filter(inf => inf.tipo === 'compra');
            } else if (tipoRegistro === 'registro-ventas') {
                filtrados = filtrados.filter(inf => inf.tipo === 'venta');
            }
        }

        // Filtro por estado (diario, semanal, mensual)
        const estado = estadoSelect?.value;
        if (estado && estado !== 'todos') {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (estado === 'diario') {
                // Filtrar solo el día actual
                const mañana = new Date(hoy);
                mañana.setDate(mañana.getDate() + 1);
                filtrados = filtrados.filter(inf => {
                    const fechaInf = new Date(inf.fechaRaw);
                    return fechaInf >= hoy && fechaInf < mañana;
                });
            } else if (estado === 'semanal') {
                // Filtrar los últimos 7 días
                const hace7Dias = new Date(hoy);
                hace7Dias.setDate(hace7Dias.getDate() - 7);
                filtrados = filtrados.filter(inf => {
                    const fechaInf = new Date(inf.fechaRaw);
                    return fechaInf >= hace7Dias;
                });
            } else if (estado === 'mensual') {
                // Filtrar el mes actual
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
                filtrados = filtrados.filter(inf => {
                    const fechaInf = new Date(inf.fechaRaw);
                    return fechaInf >= inicioMes && fechaInf <= finMes;
                });
            }
        }

        // Filtro por fecha desde
        const fechaDesde = fechaDesdeInput?.value;
        if (fechaDesde) {
            // Parsear fecha en formato d/m/Y
            const partes = fechaDesde.split('/');
            if (partes.length === 3) {
                const desde = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                desde.setHours(0, 0, 0, 0);
                filtrados = filtrados.filter(inf => {
                    const fechaInf = new Date(inf.fechaRaw);
                    fechaInf.setHours(0, 0, 0, 0);
                    return fechaInf >= desde;
                });
            }
        }

        // Filtro por fecha hasta
        const fechaHasta = fechaHastaInput?.value;
        if (fechaHasta) {
            // Parsear fecha en formato d/m/Y
            const partes = fechaHasta.split('/');
            if (partes.length === 3) {
                const hasta = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                hasta.setHours(23, 59, 59, 999); // Incluir todo el día
                filtrados = filtrados.filter(inf => {
                    const fechaInf = new Date(inf.fechaRaw);
                    return fechaInf <= hasta;
                });
            }
        }

        informesFiltrados = filtrados;
        renderizarInformes();
    }

    /**
     * Limpiar filtros
     */
    function limpiarFiltros() {
        if (tipoRegistroSelect) tipoRegistroSelect.value = '';
        if (fechaDesdeInput) fechaDesdeInput.value = '';
        if (fechaHastaInput) fechaHastaInput.value = '';
        if (estadoSelect) estadoSelect.value = 'todos';
        
        informesFiltrados = [...informes];
        renderizarInformes();
    }

    /**
     * Mostrar modal de exportación
     */
    function mostrarModalExportacion() {
        if (informesFiltrados.length === 0) {
            showWarning('No hay informes para exportar');
            return;
        }

        const modal = document.getElementById('exportModalOverlay');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Cerrar modal de exportación
     */
    function cerrarModalExportacion() {
        const modal = document.getElementById('exportModalOverlay');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Exportar informes a Excel
     */
    async function exportarAExcel() {
        if (informesFiltrados.length === 0) {
            showWarning('No hay informes para exportar');
            return;
        }

        try {
            // Verificar si SheetJS está disponible
            if (typeof XLSX === 'undefined') {
                showError('La librería de Excel no está cargada. Por favor, recargue la página.');
                return;
            }

            // Preparar datos
            const headers = ['ID', 'Fecha y Hora', 'Asociado', 'Documento', 'Teléfono', 'Carreta', 'Ruta', 'Material', 'Peso (Kg)', 'Precio por Kg', 'Precio Total', 'Tipo Asociado', 'Tipo'];
            const rows = informesFiltrados.map(inf => [
                inf.id || '',
                inf.fecha || '',
                inf.asociado || '',
                inf.documento || '',
                inf.telefono || '',
                inf.carreta || '',
                inf.ruta || '',
                inf.material || '',
                (inf.cantidadKg || 0).toFixed(2),
                (inf.precioPorKg || 0).toFixed(2),
                (inf.precioTotal || 0).toFixed(2),
                inf.tipoAsociado || '',
                inf.tipo === 'compra' ? 'Compra' : 'Venta'
            ]);

            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            // Ajustar ancho de columnas
            const colWidths = headers.map((_, colIndex) => {
                const maxLength = Math.max(
                    headers[colIndex].length,
                    ...rows.map(row => String(row[colIndex] || '').length)
                );
                return { wch: Math.min(maxLength + 2, 50) };
            });
            ws['!cols'] = colWidths;

            // Agregar hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Informes');

            // Generar nombre de archivo
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `Informe_Renacer_${fecha}.xlsx`;

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo);

            cerrarModalExportacion();
            showSuccess('Informes exportados a Excel correctamente');
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            showError('Error al exportar los informes a Excel');
        }
    }

    /**
     * Exportar informes a PDF
     */
    async function exportarAPDF() {
        if (informesFiltrados.length === 0) {
            showWarning('No hay informes para exportar');
            return;
        }

        try {
            // Verificar si jsPDF está disponible
            if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                showError('La librería de PDF no está cargada. Por favor, recargue la página.');
                return;
            }

            const { jsPDF } = window.jspdf || window;
            const doc = new jsPDF('landscape', 'mm', 'a4');

            // Título
            doc.setFontSize(16);
            doc.text('Informe Renacer', 14, 15);
            
            // Fecha del informe
            doc.setFontSize(10);
            const fechaReporte = new Date().toLocaleString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`Generado el: ${fechaReporte}`, 14, 22);

            // Preparar datos para la tabla
            const headers = [['ID', 'Fecha y Hora', 'Asociado', 'Documento', 'Carreta', 'Ruta', 'Material', 'Peso (Kg)', 'Precio Total', 'Tipo']];
            const rows = informesFiltrados.map(inf => [
                inf.id || '',
                inf.fecha || '',
                (inf.asociado || '').substring(0, 20), // Limitar longitud
                (inf.documento || '').substring(0, 15),
                (inf.carreta || '').substring(0, 10),
                (inf.ruta || '').substring(0, 15),
                (inf.material || '').substring(0, 20),
                (inf.cantidadKg || 0).toFixed(2),
                `$${(inf.precioTotal || 0).toFixed(2)}`,
                inf.tipo === 'compra' ? 'Compra' : 'Venta'
            ]);

            // Agregar tabla usando autoTable
            if (doc.autoTable) {
                doc.autoTable({
                    head: headers,
                    body: rows,
                    startY: 28,
                    styles: { fontSize: 7, cellPadding: 2 },
                    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    margin: { left: 14, right: 14 }
                });
            } else {
                // Fallback: texto simple si autoTable no está disponible
                doc.setFontSize(8);
                let y = 28;
                doc.text('ID | Fecha | Asociado | Material | Total', 14, y);
                y += 5;
                rows.slice(0, 20).forEach(row => {
                    doc.text(row.join(' | '), 14, y);
                    y += 5;
                });
            }

            // Generar nombre de archivo
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `Informe_Renacer_${fecha}.pdf`;

            // Descargar archivo
            doc.save(nombreArchivo);

            cerrarModalExportacion();
            showSuccess('Informes exportados a PDF correctamente');
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            showError('Error al exportar los informes a PDF');
        }
    }

    // Event listeners
    if (tipoRegistroSelect) {
        tipoRegistroSelect.addEventListener('change', aplicarFiltros);
    }

    if (btnApply) {
        btnApply.addEventListener('click', aplicarFiltros);
    }

    if (btnClear) {
        btnClear.addEventListener('click', limpiarFiltros);
    }

    if (btnExport) {
        btnExport.addEventListener('click', mostrarModalExportacion);
        
        // Funciones para los botones de acción
        window.descargarInforme = async (id, tipo) => {
            console.log('Descargar informe:', id, tipo);
            // Implementar lógica de descarga
            if (typeof showSuccess === 'function') {
                showSuccess('Función de descarga en desarrollo');
            }
        };
        
        window.editarInforme = async (id, tipo) => {
            console.log('Editar informe:', id, tipo);
            if (tipo === 'compra') {
                // Redirigir a compras o abrir modal
                if (typeof window.editarCompra === 'function') {
                    await window.editarCompra(id);
                } else {
                    window.location.href = 'Compras.html';
                }
            } else if (tipo === 'venta') {
                // Redirigir a ventas o abrir modal
                if (typeof window.editarVenta === 'function') {
                    await window.editarVenta(id);
                } else {
                    window.location.href = 'Ventas.html';
                }
            }
        };
        
        window.eliminarInforme = async (id, tipo) => {
            if (!confirm('¿Está seguro de eliminar este registro?')) return;
            
            try {
                if (tipo === 'compra') {
                    if (window.API && window.API.Ingreso) {
                        await window.API.Ingreso.delete(id);
                        if (typeof showSuccess === 'function') {
                            showSuccess('Registro eliminado correctamente');
                        }
                        cargarInformes();
                    }
                } else if (tipo === 'venta') {
                    if (window.API && window.API.Egreso) {
                        await window.API.Egreso.delete(id);
                        if (typeof showSuccess === 'function') {
                            showSuccess('Registro eliminado correctamente');
                        }
                        cargarInformes();
                    }
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                if (typeof showError === 'function') {
                    showError('Error al eliminar el registro');
                }
            }
        };
    }

    // Event listeners para el modal de exportación
    const exportModalOverlay = document.getElementById('exportModalOverlay');
    if (exportModalOverlay) {
        // Cerrar al hacer click en el overlay
        exportModalOverlay.addEventListener('click', (e) => {
            if (e.target === exportModalOverlay) {
                cerrarModalExportacion();
            }
        });

        // Botones de exportación
        const excelOption = exportModalOverlay.querySelector('.excel-option');
        const pdfOption = exportModalOverlay.querySelector('.pdf-option');

        if (excelOption) {
            excelOption.addEventListener('click', (e) => {
                e.preventDefault();
                exportarAExcel();
            });
        }

        if (pdfOption) {
            pdfOption.addEventListener('click', (e) => {
                e.preventDefault();
                exportarAPDF();
            });
        }
    }

    // Inicializar calendarios Flatpickr
    if (typeof flatpickr !== 'undefined') {
        if (fechaDesdeInput) {
            flatpickr(fechaDesdeInput, {
                locale: 'es',
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
        if (fechaHastaInput) {
            flatpickr(fechaHastaInput, {
                locale: 'es',
                dateFormat: 'd/m/Y',
                allowInput: true
            });
        }
    }

    // Cargar informes al inicializar
    await cargarInformes();

    // Escuchar eventos de operaciones guardadas para recargar informes
    window.addEventListener('operacionGuardada', () => {
        setTimeout(async () => {
            await cargarInformes();
        }, 500);
    });

    // ============================================
    // FUNCIONES DE EXPORTACIÓN EXCEL/PDF
    // (Mantener funcionalidad existente)
    // ============================================
    
    const CONFIG = {
        nombreArchivo: 'Informe_Renacer',
        columnasMantener: [
            'ID', 'FECHA', 'FECHAY', 'HORA', 'ASOCIADO', 'SOCIO',
            'DOCUMENTO', 'DOC', 'CARRETA', 'RUTA', 'MATERIAL',
            'PESO', 'PRECIO', 'TOTAL', 'RECHAZADO'
        ]
    };

    const TableUtils = {
        eliminarColumna(table, index) {
            if (!table || index === -1) return;
            const eliminarCelda = (row) => row.children[index] && row.removeChild(row.children[index]);
            Array.from(table.querySelectorAll('tr')).forEach(eliminarCelda);
        },
        // ... (resto de funciones de utilidad si es necesario)
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renacerInitInformes);
} else {
    renacerInitInformes();
}
