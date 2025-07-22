const API_BASE_URL = 'http://localhost:8080';
let graficaActual = null;
let vistasActualizadas = false; // Control de si las vistas ya fueron actualizadas para este evento

// Obtener ID desde URL
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

async function buscarEstadisticas(eventoId) {
  const errorDiv = document.getElementById('errorMensaje');
  errorDiv.textContent = '';

  try {
    // Obtener estadísticas directamente
    const res = await fetch(`${API_BASE_URL}/api/analisis/event/${eventoId}`);
    if (!res.ok) throw new Error(`No hay estadísticas para el evento ID: ${eventoId}`);
    const data = await res.json();

    mostrarEstadisticas(data, eventoId);

    // Verificamos si el evento es visible en pantalla
    observarVisibilidad(eventoId);

  } catch (error) {
    errorDiv.textContent = error.message;
    document.getElementById('estadisticasContainer').style.display = 'none';
  }
}

function mostrarEstadisticas(datos, eventoId) {
  const grid = document.getElementById('estadisticasGrid');

  const views = datos.totalViews ?? 0;
  const registros = datos.totalRegistrations ?? 0;
  const tickets = datos.totalTicketsSold ?? 0;
  const satisfaccion = (datos.satisfactionAvg ?? 0).toFixed(2);

  grid.innerHTML = `
    <div class="estadistica-card"><h4>${views.toLocaleString()}</h4><p>👁️ Visualizaciones</p></div>
    <div class="estadistica-card"><h4>${registros.toLocaleString()}</h4><p>📝 Registros</p></div>
    <div class="estadistica-card"><h4>${tickets.toLocaleString()}</h4><p>🎫 Entradas Vendidas</p></div>
    <div class="estadistica-card"><h4>${satisfaccion} / 5</h4><p>⭐ Satisfacción</p></div>
  `;

  document.getElementById('estadisticasContainer').style.display = 'block';
  generarGrafica({ views, registros, tickets, satisfaccion: parseFloat(satisfaccion) }, eventoId);
}

function generarGrafica(valores, eventoId) {
  const ctx = document.getElementById('graficaEstadisticas').getContext('2d');
  if (graficaActual) {
    graficaActual.data.datasets[0].data = [valores.views, valores.registros, valores.tickets, 0];
    graficaActual.data.datasets[1].data = [0, 0, 0, valores.satisfaccion];
    graficaActual.options.plugins.title.text = `Estadísticas del Evento ID: ${eventoId}`;
    graficaActual.update();
    return;
  }

  graficaActual = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Visualizaciones', 'Registros', 'Entradas Vendidas', 'Satisfacción'],
      datasets: [
        {
          label: 'Métricas del evento',
          data: [valores.views, valores.registros, valores.tickets, 0],
          backgroundColor: ['#3498db', '#e67e22', '#2ecc71', '#ccc'],
          borderRadius: 10,
          yAxisID: 'yCantidad'
        },
        {
          label: 'Satisfacción',
          data: [0, 0, 0, valores.satisfaccion],
          backgroundColor: ['transparent', 'transparent', 'transparent', '#f1c40f'],
          borderRadius: 10,
          yAxisID: 'ySatisfaccion'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yCantidad: {
          beginAtZero: true,
          position: 'left',
          title: {
            display: true,
            text: 'Cantidad',
            font: { size: 13, weight: 'bold' },
            color: '#2c3e50'
          },
          ticks: { color: '#2c3e50', font: { size: 12 } },
          grid: { drawOnChartArea: true }
        },
        ySatisfaccion: {
          beginAtZero: true,
          max: 5,
          position: 'right',
          title: {
            display: true,
            text: 'Satisfacción (0 - 5)',
            font: { size: 13, weight: 'bold' },
            color: '#f39c12'
          },
          ticks: { color: '#f39c12', font: { size: 12 }, stepSize: 1 },
          grid: { drawOnChartArea: false }
        },
        x: {
          ticks: { color: '#2c3e50', font: { size: 12 } }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Estadísticas del Evento ID: ${eventoId}`,
          font: { size: 18, weight: 'bold' },
          color: '#2c3e50',
          padding: { bottom: 15 }
        },
        tooltip: {
          backgroundColor: '#2c3e50',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          callbacks: {
            label: ctx => {
              const label = ctx.label;
              const value = ctx.raw;
              return ctx.dataset.label === 'Satisfacción'
                ? `${label}: ${value.toFixed(2)} / 5`
                : `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

function observarVisibilidad(eventoId) {
  const elementoEvento = document.getElementById('estadisticasContainer');

  const observer = new IntersectionObserver(entries => {
    // Si el evento es visible en el viewport y las vistas aún no han sido actualizadas
    if (entries[0].isIntersecting && !vistasActualizadas) {
      vistasActualizadas = true; // Aseguramos que solo se haga una vez
      actualizarVistas(eventoId);
    }
  }, { threshold: 0.5 });  // Umbral del 50% de visibilidad para considerarlo como "visible"

  observer.observe(elementoEvento);
}

async function actualizarVistas(eventoId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/analisis/${eventoId}?action=view`, { method: 'PUT' });
    if (!res.ok) throw new Error("No se pudo actualizar las vistas.");
  } catch (error) {
    console.error("Error al incrementar vistas:", error.message);
  }
}

// Nueva función para actualizar las estadísticas
async function actualizarEstadisticas() {
  const eventoId = document.querySelector('.evento-id-input').value.trim(); // Usamos querySelector para seleccionar por clase
  if (!eventoId) {
    alert("Por favor, ingresa un ID de evento.");
    return;
  }

  try {
    await buscarEstadisticas(eventoId); // Llamamos a buscarEstadisticas con el ID ingresado
  } catch (error) {
    alert("Hubo un error al actualizar las estadísticas: " + error.message);
  }
}

// Inicialización rápida al cargar
window.addEventListener("DOMContentLoaded", () => {
  const idUrl = getQueryParam('id');
  if (idUrl) {
    document.querySelector('.evento-id-input').value = idUrl;
    buscarEstadisticas(idUrl); // Sin esperar input manual
  }
});
