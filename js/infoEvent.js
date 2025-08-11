document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = Number(params.get("id"));
  const usersId = localStorage.getItem('userId');

  const detailsContainer = document.getElementById("eventDetails");
  const titleElement = document.getElementById("eventTitle");

  if (!eventId) {
    detailsContainer.innerHTML = "<p>❌ ID de evento no especificado.</p>";
    return;
  }

  fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/${eventId}`, {
    method: 'GET',
    headers: { "Accept": "application/json" }
  })
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener el evento");
      return response.json();
    })
    .then(evento => {
      titleElement.textContent = evento.name;

      const imagenEvento = evento.imagenes?.find(img =>
        img.url && img.url.includes("/imagenes/") && !img.url.includes("Error")
      );
      const imagenUrl = imagenEvento?.url || 'https://source.unsplash.com/800x400/?event';

      const opcionesFecha = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const fechaInicio = new Date(evento.startDate).toLocaleString('es-CO', opcionesFecha);
      const fechaFin = new Date(evento.endDate).toLocaleString('es-CO', opcionesFecha);

      // === HTML renderizado dinámicamente ===
      detailsContainer.innerHTML = `
  <div class="volver-container">
    <a href="userEvents.html" class="btn-volver">⬅ Volver al inicio</a>
  </div>

  <img src="${imagenUrl}" alt="Imagen del evento" class="event-banner" />

  <div class="info">
    <p><strong>📅 Fecha de inicio:</strong> ${fechaInicio}</p>
    <p><strong>📅 Fecha de fin:</strong> ${fechaFin}</p>
    <p><strong>📍 Dirección:</strong> ${evento.address}</p>
    <p><strong>📌 Categoría:</strong> ${evento.category}</p>
    <p><strong>📄 Descripción:</strong> ${evento.description}</p>
    <p><strong>🗺️ Ubicación Geográfica :</strong></p>
  </div>

  <div id="map" style="height: 300px; margin-top: 20px;"></div>

  <div class="favorito-container" style="text-align: right; margin-top: 1rem;">
    <button id="btn-favorito" class="btn-favorito" aria-label="Guardar como favorito">
      <span class="corazon">♡</span>
      <span class="texto">Agregar a favoritos</span>
    </button>
  </div>

  <div class="actions">
    <button onclick="comprarBoleta(${evento.id})" class="register-btn">Registrar asistencia</button>
    <button onclick="calificarEvento(${evento.id})" class="btn btn-success ml-2">Calificar evento</button>
  </div>
`;


      // === Favoritos: lógica de backend ===
      function agregarFavoritoBackend(eventId) {
        return fetch(`https://ticket-backend-bkkf.onrender.com/api/usuarios/${usersId}/favoritos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: eventId })
        })
          .then(res => {
            if (!res.ok) throw new Error('Error al agregar favorito');
            return res.text();
          });
      }

      function eliminarFavoritoBackend(eventId) {
        return fetch(`https://ticket-backend-bkkf.onrender.com/api/usuarios/${usersId}/favoritos/${eventId}`, {
          method: 'DELETE'
        })
          .then(res => {
            if (!res.ok) throw new Error('Error al eliminar favorito');
            return res.text();
          });
      }

      // === Favoritos: estado e interacción ===
      const btnFavorito = document.getElementById("btn-favorito");
      const corazon = btnFavorito.querySelector(".corazon");
      const texto = btnFavorito.querySelector(".texto");
      const favoritosKey = "eventosFavoritos";
      let favoritos = JSON.parse(localStorage.getItem(favoritosKey)) || [];

      const estaEnFavoritos = favoritos.includes(evento.id);

      // Estado inicial
      if (estaEnFavoritos) {
        btnFavorito.classList.add("active");
        corazon.textContent = "♥";
        texto.textContent = "Guardado";
      }

      // Click: toggle favoritos
      btnFavorito.addEventListener("click", () => {
        if (favoritos.includes(evento.id)) {
          eliminarFavoritoBackend(evento.id)
            .then(() => {
              favoritos = favoritos.filter(id => id !== evento.id);
              localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
              btnFavorito.classList.remove("active");
              corazon.textContent = "♡";
              texto.textContent = "Agregar a favoritos";
            })
            .catch(err => alert(err.message));
        } else {
          agregarFavoritoBackend(eventId)
            .then(() => {
              favoritos.push(evento.id);
              localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
              btnFavorito.classList.add("active");
              corazon.textContent = "♥";
              texto.textContent = "Guardado";
            })
            .catch(err => alert(err.message));
        }
      });

      // Mostrar mapa si hay coordenadas
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
  L.marker([lat, lng]).addTo(map).bindPopup("Ubicación del evento").openPopup();
}

function comprarBoleta(eventId) {
  window.location.href = `registroEvento.html?id=${eventId}`;
}

function calificarEvento(eventId) {
  window.location.href = `encuesta.html?eventId=${eventId}`;
}
