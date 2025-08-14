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
    <a href="index.html" class="btn-volver">⬅ Volver al inicio</a>
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

  <div class="share-container">
  <h3>¡Comparte tu experiencia!</h3>
  <div class="social-buttons">
    <button class="social-btn facebook" onclick="shareOnFacebook()">
      <i class="fab fa-facebook"></i> Facebook
    </button>
    <button class="social-btn twitter" onclick="shareOnTwitter()">
      <i class="fab fa-twitter"></i> Twitter
    </button>
    <button class="social-btn whatsapp" onclick="shareOnWhatsApp()">
      <i class="fab fa-whatsapp"></i> WhatsApp
    </button>
    <button class="social-btn instagram" onclick="shareOnInstagram()">
      <i class="fab fa-instagram"></i> Instagram
    </button>
  </div>
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

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("¡Acabo de tener una experiencia increíble!");
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("¡Acabo de tener una experiencia increíble! 🚀");
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("¡Hola! Te comparto esta experiencia increíble: ");
  window.open(`https://wa.me/?text=${text}${url}`, '_blank');
}

function shareOnInstagram() {
  const text = "¡Acabo de tener una experiencia increíble! 🚀 " + window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #E4405F, #833AB4);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
      `;
      notification.textContent = '📋 ¡Copiado! Pégalo en tu Story de Instagram';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    });
  }

  setTimeout(() => {
    window.open('https://www.instagram.com/', '_blank');
  }, 500);
}

// Ripple effect
document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("social-btn")) return;

  const ripple = document.createElement('span');
  const rect = e.target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  e.target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// Animation styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyles);
