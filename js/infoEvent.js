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
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener el evento");
      return res.json();
    })
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
          <p><strong>📄 Descripción:</strong> ${evento.description}</p>
          <p><strong>🗺️ Ubicación Geografica :</strong></p>

        </div>

        <div id="map" style="height: 300px; margin-top: 20px;"></div>

        <div class="actions">
          <button onclick="comprarBoleta(${evento.id})" class="buy-btn">
            Registrarse al evento
          </button>
        </div>
      `;

      // Mostrar el mapa con Leaflet
      if (evento.latitude && evento.longitude) {
        mostrarMapa(evento.latitude, evento.longitude);
      }
    })
    .catch(error => {
      detailsContainer.innerHTML = "<p>⚠️ Error al cargar los detalles del evento.</p>";
      console.error("Error:", error);
    });
});

function mostrarMapa(lat, lng) {
  const map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Ubicación del evento")
    .openPopup();
}

function comprarBoleta(eventId) {
  window.location.href = `registroEvento.html?id=${eventId}`;
}
