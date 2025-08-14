document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recommendedEvents");
  const userId = localStorage.userId;

  if (!userId) {
    container.innerHTML = `<p>⚠️ Debes iniciar sesión para ver recomendaciones.</p>`;
    return;
  }

  fetch(`https://ticket-backend-bkkf.onrender.com/api/recommendations/${userId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al obtener recomendaciones");
      }
      return response.json();
    })
    .then(data => {
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = `<p>No hay recomendaciones disponibles en este momento.</p>`;
        return;
      }

      data.forEach(evento => renderizarCard(evento, container));
    })
    .catch(error => {
      container.innerHTML = `<p class="error">⚠️ Error cargando recomendaciones: ${error.message}</p>`;
      console.error("Error:", error);
    });
});

function renderizarCard(evento, contenedor) {
  const card = document.createElement("div");
  card.className = "event-card";

  const fecha = evento.startDate
    ? new Date(evento.startDate).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : "Sin fecha";

  const precio = evento.ticketPrice != null
    ? `$${parseFloat(evento.ticketPrice).toFixed(2)}`
    : `<span class="text-muted">No asignado</span>`;

  // Debug: Ver imágenes en consola
  console.log(`Evento ${evento.id} - imágenes:`, evento.imagenes);

  const baseURL = "https://ticket-backend-bkkf.onrender.com";

  const imagenEvento = evento.imagenes?.find(img =>
    img.url && !img.url.includes("Error")
  );

  const imagenUrl = imagenEvento?.url
    ? (imagenEvento.url.startsWith('http')
        ? imagenEvento.url
        : baseURL + imagenEvento.url)
    : 'https://source.unsplash.com/400x200/?event';

  card.innerHTML = `
    <img src="${imagenUrl}" 
         alt="Imagen de ${evento.name}" 
         class="event-image" loading="lazy" />

    <div class="event-content">
      <h3 class="event-title">${evento.name}</h3>
      <p class="event-date"><i class="lni lni-calendar"></i> ${fecha}</p>
      <p class="event-description">${evento.description}</p>
      <p class="event-location"><i class="lni lni-map-marker"></i> ${evento.address}</p>
      <p class="event-price"><i class="lni lni-dollar"></i> <strong>Precio:</strong> ${precio}</p>
      <button class="view-btn" onclick="verEvento(${evento.id})">Ver más</button>
    </div>
  `;

  contenedor.appendChild(card);
}

function verEvento(id) {
  window.location.href = `infoEvent.html?id=${id}`;
}
