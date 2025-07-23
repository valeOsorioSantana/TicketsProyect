// Call the dataTables jQuery plugin
$(document).ready(function () {

  cargarUsuarios()

  $('#usuarios').DataTable();
  //checkAuthentication();
  actualizarEmailDelUsuario();

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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buscarBtn").addEventListener("click", cargarSesiones);
});

async function cargarSesiones() {
  const eventName = document.getElementById("eventNameInput").value.trim();
  const sessionsList = document.getElementById("sessionsList");

  sessionsList.innerHTML = ""; // Limpia contenido previo

  if (!eventName) {
    mostrarMensaje("Por favor ingresa el nombre del evento.");
    return;
  }

  try {
    // Buscar el evento por nombre
    const eventRes = await fetch(`http://localhost:8080/api/sessions/name/${encodeURIComponent(eventName)}`);
    if (!eventRes.ok) {
      mostrarMensaje("⚠️ Evento no encontrado.");
      return;
    }

    const event = await eventRes.json();
    const eventId = event.id;

    // Obtener las sesiones del evento
    const sessionsRes = await fetch(`http://localhost:8080/api/sessions/event/${eventId}`);
    if (!sessionsRes.ok) throw new Error("Error al obtener las sesiones.");

    const sessions = await sessionsRes.json();

    if (!sessions.length) {
      mostrarMensaje("📭 No hay sesiones registradas para este evento.");
      return;
    }

    // Mostrar sesiones
    sessions.forEach(session => {
      const card = document.createElement("div");
      card.classList.add("session-card");

      card.innerHTML = `
        <h4>${session.title}</h4>
        <p><strong>Descripción:</strong> ${session.description}</p>
        <p><strong>Orador:</strong> ${session.speakerName}</p>
        <p><strong>Biografia del Orador:</strong> ${session.speakerBio}</p>
        <p><strong>Inicio:</strong> ${formatearFecha(session.startTime)}</p>
        <p><strong>Fin:</strong> ${formatearFecha(session.endTime)}</p>
        <button class="btn btn-outline-danger btn-sm mt-2" onclick="eliminarSesion(${session.id})">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      `;

      sessionsList.appendChild(card);
    });

  } catch (err) {
    mostrarMensaje("❌ Error al cargar sesiones: " + err.message);
  }
}

async function eliminarSesion(id) {
  const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta sesión?");
  if (!confirmacion) return;

  try {
    const res = await fetch(`http://localhost:8080/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar la sesión.");

    alert("✅ Sesión eliminada con éxito.");
    cargarSesiones();

  } catch (err) {
    alert("❌ " + err.message);
  }
}

function mostrarMensaje(texto) {
  const sessionsList = document.getElementById("sessionsList");
  sessionsList.innerHTML = `
    <div id="noSessionsMessage" class="text-center mt-4">
      <img src="img/no-data.svg" alt="Sin resultados" width="180" class="mb-3">
      <p class="text-muted font-weight-bold">${texto}</p>
    </div>
  `;
}

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-ES", {
    year: "numeric", month: "short", day: "numeric"
  });
}
