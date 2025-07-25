document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventContainer");

  // Llama a la API de eventos
  fetch('http://localhost:8080/api/public/events/', {
    method: 'GET',
    headers: { "Accept": "application/json" }
  })
    .then(res => res.json())
    .then(data => {
      // Limpia skeletons
      container.innerHTML = "";

      // Filtra y renderiza solo eventos "PUBLICADO"
      data
        .filter(ev => ev.status === "PUBLICADO")
        .forEach(evento => renderizarCard(evento, container));
    })
    .catch(error => {
      container.innerHTML = `<p class="error">⚠️ Error cargando eventos</p>`;
      console.error("Error cargando eventos:", error);
    });
});

function renderizarCard(evento, contenedor) {
  const card = document.createElement("div");
  card.className = "event-card";
  card.innerHTML = `
    <img src="${evento.imagen?.url || 'https://source.unsplash.com/400x200/?event'}" 
         alt="${evento.name}" 
         class="event-image" loading="lazy" />
    <div class="event-content">
      <h3 class="event-title">${evento.name}</h3>
      <p class="event-date"><i class="lni lni-calendar"></i> ${evento.startDate}</p>
      <p class="event-description">${evento.description}</p>
      <p class="event-location"><i class="lni lni-map-marker"></i> ${evento.address}</p>
      <button class="view-btn" onclick="verEvento(${evento.id})">Ver más</button>
    </div>
  `;
  contenedor.appendChild(card);
}

function verEvento(id) {
  window.location.href = `infoEvent.html?id=${id}`;
}
