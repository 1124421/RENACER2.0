// ========================================
// 2. INICIALIZACIÓN DE GRÁFICOS
// ========================================

/**
 * Inicializa el gráfico circular (Pie Chart)
 */
function initPieChart() {
  try {
    const pieCtx = document.getElementById('pieChart');

    if (!pieCtx) {
      console.warn('⚠️ Canvas "pieChart" no encontrado');
      return;
    }

    new Chart(pieCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Plástico', 'Papel', 'Cartón', 'Vidrio'],
        datasets: [
          {
            data: [35, 25, 20, 20],
            backgroundColor: ['#2d5a47', '#4A9B9B', '#F59E0B', '#EF4444'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.parsed + '%';
              },
            },
          },
        },
        cutout: '65%',
      },
    });

    console.log('✅ Gráfico circular inicializado');
  } catch (error) {
    console.error('❌ Error al crear el gráfico circular:', error);
  }
}

/**
 * Inicializa el gráfico de líneas (Line Chart)
 */
function initLineChart() {
  try {
    const lineCtx = document.getElementById('lineChart');

    if (!lineCtx) {
      console.warn('⚠️ Canvas "lineChart" no encontrado');
      return;
    }

    new Chart(lineCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            label: 'Plástico',
            data: [12000, 15000, 13000, 17000, 14000, 16000, 18000, 20000, 17000, 15000, 19000, 22000],
            borderColor: '#2D5F5D',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#2D5F5D',
          },
          {
            label: 'Papel',
            data: [15000, 12000, 16000, 11000, 13000, 17000, 14000, 16000, 19000, 15000, 17000, 20000],
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#F59E0B',
          },
          {
            label: 'Cartón',
            data: [18000, 14000, 17000, 13000, 15000, 19000, 16000, 18000, 21000, 17000, 19000, 23000],
            borderColor: '#4A9B9B',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#4A9B9B',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: '#f0f0f0' },
            ticks: { color: '#9CA3AF', font: { size: 12 } },
          },
          y: {
            grid: { color: '#f0f0f0' },
            ticks: {
              color: '#9CA3AF',
              font: { size: 12 },
              callback: function (value) {
                return '$' + value.toLocaleString();
              },
            },
          },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    });

    console.log('✅ Gráfico de líneas inicializado');
  } catch (error) {
    console.error('❌ Error al crear el gráfico de líneas:', error);
  }
}

// ========================================
// 3. CÁLCULO DINÁMICO DE PRECIOS
// ========================================

function updateItemPrice(addedItem, quantity) {
  const pricePerKg = parseFloat(addedItem.dataset.pricePerKg);
  const qty = parseFloat(quantity) || 0;
  const totalPrice = pricePerKg * qty;
  const priceSpan = addedItem.querySelector('.added-item-price');
  if (priceSpan) {
    // Formatear a miles sin decimales (ej: 2.000)
    priceSpan.textContent = '$' + Math.round(totalPrice).toLocaleString('es-CO');
  }
}

function initDynamicPriceCalculation() {
  // Cambios por blur/change
  document.addEventListener('change', function (event) {
    if (event.target.classList.contains('quantity-field')) {
      const addedItem = event.target.closest('.added-item');
      if (!addedItem) return;
      updateItemPrice(addedItem, event.target.value);
      console.log('✅ Precio actualizado (change)');
    }
  });

  // Cambios en tiempo real
  document.addEventListener('input', function (event) {
    if (event.target.classList.contains('quantity-field')) {
      const addedItem = event.target.closest('.added-item');
      if (!addedItem) return;
      updateItemPrice(addedItem, event.target.value);
    }
  });

  console.log('✅ Cálculo dinámico de precios inicializado');
}


// ========================================
// 5. INICIALIZACIÓN PRINCIPAL
// ========================================

function init() {
  console.log('🚀 Inicializando Dashboard de Reciclaje...');

  // Verificar modales
 

  // Inicializar gráficos
  initPieChart();
  initLineChart();

  // Inicializar cálculo dinámico de precios
  initDynamicPriceCalculation();

  console.log('✅ Dashboard inicializado correctamente');
}

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // El DOM ya está listo
  init();
}