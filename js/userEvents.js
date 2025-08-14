// Call the dataTables jQuery plugin
$(document).ready(function () {

  cargarUsuarios()

  $('#usuarios').DataTable();
  //checkAuthentication();
  actualizarEmailDelUsuario();

    document.getElementById('verMisTicketsBtn').addEventListener('click', verMisTickets);


});

function checkAuthentication() {
  const token = localStorage.token;
  if (!token) {
    // Si no hay token, redirigir al inicio de sesión
    alert("No se ha iniciado sesión!");
    window.location.href = 'login.html'
  }
}

function logout() {
  // Eliminar el token del localStorage
  localStorage.removeItem('token'); // Asegúrate de usar la clave que usaste para guardar el token
  localStorage.removeItem('email');
  localStorage.removeItem('nombre');
  // Redirigir al usuario a la página de inicio de sesión o a otra página

  window.location.href = 'login.html'
}

function actualizarEmailDelUsuario() {
  document.getElementById('txt-name-usuario').outerHTML = localStorage.nombre;
}

function verMisTickets() {
  const token = localStorage.token;
  if (!token) {
    alert("Por favor, inicie sesión para ver sus tickets.");
    window.location.href = 'login.html';
    return;
  }

  window.location.href = 'tickets.html';
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventContainer");

  fetch('https://ticket-backend-bkkf.onrender.com/api/public/events/', {
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

  const fecha = evento.startDate ? new Date(evento.startDate).toLocaleDateString() : "Sin fecha";
  const precio = evento.ticketPrice != null
    ? `$${parseFloat(evento.ticketPrice).toFixed(2)}`
    : `<span class="text-muted">No asignado</span>`;

  // Buscar la imagen principal del evento
  let imagenEvento = evento.imagenes?.find(img => img.url && img.url.includes("/imagenes/") && !img.url.includes("Error"));
  const imagenUrl = imagenEvento?.url || 'https://source.unsplash.com/400x200/?event'; // Imagen por defecto si no hay una imagen válida

  card.innerHTML = `
    <img src="${imagenUrl}" 
         alt="${evento.name}" 
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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('locationFilterForm');
  const input = document.getElementById('locationInput');
  const clearBtn = document.getElementById('clearFilterBtn');
  const container = document.getElementById('eventContainer');

  async function cargarEventos(location = '') {
    container.innerHTML = '<p>Cargando eventos...</p>';
    try {
      let url = 'https://ticket-backend-bkkf.onrender.com/api/public/events/';
      if (location) {
        url += `filterByLocation?location=${encodeURIComponent(location)}`;
      }
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Error al cargar eventos');

      const data = await res.json();
      container.innerHTML = '';

      const eventosFiltrados = data.filter(ev => ev.status === "PUBLICADO");

      if (eventosFiltrados.length === 0) {
        container.innerHTML = '<p>No se encontraron eventos para esa ubicación.</p>';
        return;
      }

      eventosFiltrados.forEach(evento => renderizarCard(evento, container));
    } catch (error) {
      container.innerHTML = `<p class="error">⚠️ Error cargando eventos: ${error.message}</p>`;
      console.error(error);
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const location = input.value.trim();
    if (!location) return;
    cargarEventos(location);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    cargarEventos();
  });

  // Carga inicial sin filtro
  cargarEventos();
});
