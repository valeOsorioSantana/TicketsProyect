// Recuperamos el ID del evento de la URL o alguna otra fuente
const eventId = 1; // Ejemplo estático; reemplázalo por la lógica dinámica si es necesario

// Función para crear una nueva sesión
async function crearSesion() {
  const title = document.getElementById('sessionTitle').value;
  const description = document.getElementById('sessionDescription').value;
  const startTime = document.getElementById('sessionStartTime').value;
  const endTime = document.getElementById('sessionEndTime').value;
  const speakerName = document.getElementById('speakerName').value;
  const speakerBio = document.getElementById('speakerBio').value;

  try {
    const response = await fetch(`http://localhost:8080/api/sessions/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        startTime,
        endTime,
        speakerName,
        speakerBio
      })
    });
    
    if (!response.ok) throw new Error('Error al crear la sesión');
    
    alert('Sesión creada con éxito');
    cargarSesiones(); // Recargar sesiones
  } catch (error) {
    alert(error.message);
  }
}

// Función para cargar las sesiones del evento
async function cargarSesiones() {
  try {
    const response = await fetch(`http://localhost:8080/api/sessions/${eventId}`);
    const sessions = await response.json();

    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';
    
    if (sessions.length === 0) {
      sessionsList.innerHTML = '<p>No hay sesiones para este evento aún.</p>';
    } else {
      sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.classList.add('session-card');
        sessionElement.innerHTML = `
          <h4>${session.title}</h4>
          <p><strong>Descripción:</strong> ${session.description}</p>
          <p><strong>Orador:</strong> ${session.speakerName}</p>
          <p><strong>Fecha de Inicio:</strong> ${session.startTime}</p>
          <p><strong>Fecha de Fin:</strong> ${session.endTime}</p>
          <button onclick="eliminarSesion(${session.id})" class="btn btn-danger">Eliminar</button>
        `;
        sessionsList.appendChild(sessionElement);
      });
    }
  } catch (error) {
    alert('Error al cargar las sesiones: ' + error.message);
  }
}

// Función para eliminar una sesión
async function eliminarSesion(sessionId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta sesión?')) return;

  try {
    const response = await fetch(`http://localhost:8080/api/sessions/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar la sesión');
    
    alert('Sesión eliminada con éxito');
    cargarSesiones(); // Recargar sesiones
  } catch (error) {
    alert(error.message);
  }
}

// Cargar las sesiones al inicio
window.onload = cargarSesiones;
