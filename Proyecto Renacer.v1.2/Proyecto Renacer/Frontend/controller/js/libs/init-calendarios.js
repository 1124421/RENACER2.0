// Inicialización de calendarios Flatpickr con seguimiento de posición
function renacerInitCalendarios() {
  if (typeof flatpickr === 'undefined') return;

  const fpConfig = {
    locale: "es",
    dateFormat: "d/m/Y",
    onOpen: function(selectedDates, dateStr, instance) {
      const input = instance.input;
      const calendar = instance.calendarContainer;
      
      const updatePosition = () => {
        const rect = input.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        calendar.style.position = 'absolute';
        calendar.style.top = `${rect.bottom + scrollY + 8}px`;
        calendar.style.left = `${rect.left}px`;
      };
      
      const track = () => {
        updatePosition();
        instance._positionTracker = requestAnimationFrame(track);
      };
      
      track();
    },
    onClose: function(selectedDates, dateStr, instance) {
      if (instance._positionTracker) {
        cancelAnimationFrame(instance._positionTracker);
      }
    }
  };

  // Inicializar calendarios en Informe.html
  if (document.getElementById('fechaDesde')) {
    flatpickr("#fechaDesde", fpConfig);
  }
  if (document.getElementById('fechaHasta')) {
    flatpickr("#fechaHasta", fpConfig);
  }

  // Inicializar calendarios en asociado.html
  if (document.getElementById('fechaDesdeAsociado')) {
    flatpickr("#fechaDesdeAsociado", fpConfig);
  }
  if (document.getElementById('fechaHastaAsociado')) {
    flatpickr("#fechaHastaAsociado", fpConfig);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renacerInitCalendarios);
} else {
  renacerInitCalendarios();
}
