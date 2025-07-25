document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const detailsContainer = document.getElementById("eventDetails");
  const titleElement = document.getElementById("eventTitle");

  if (!eventId) {
    detailsContainer.innerHTML = "<p>❌ ID de evento no especificado.</p>";
    return;
  }

  fetch(`http://localhost:8080/api/public/events/${eventId}`, {
    method: 'GET',
    headers: { "Accept": "application/json" }
  })
    .then(res => res.json())
    .then(evento => {
      titleElement.textContent = evento.name;

      detailsContainer.innerHTML = `
        <img src="${evento.imagen?.url || 'https://source.unsplash.com/800x400/?event'}" 
             alt="Imagen del evento" class="event-banner" />

        <div class="info">
          <p><strong>📅 Fecha de inicio:</strong> ${evento.startDate}</p>
          <p><strong>📅 Fecha de fin:</strong> ${evento.endDate}</p>
          <p><strong>📍 Dirección:</strong> ${evento.address}</p>
          <p><strong>📌 Categoría:</strong> ${evento.category}</p>
          <p><strong>🗺️ Ubicación (lat, lng):</strong> ${evento.latitude}, ${evento.longitude}</p>
          <p><strong>📄 Descripción:</strong> ${evento.description}</p>
        </div>

        <div class="actions">
          <button onclick="comprarBoleta(${evento.id})" class="buy-btn">
            Comprar Entrada
          </button>
        </div>
      `;
    })
    .catch(error => {
      detailsContainer.innerHTML = "<p>⚠️ Error al cargar los detalles del evento.</p>";
      console.error("Error:", error);
    });
});

function comprarBoleta(eventId) {
  // Aquí puedes redirigir a un formulario de compra o abrir un modal
  window.location.href = `comprar.html?id=${eventId}`;
}
