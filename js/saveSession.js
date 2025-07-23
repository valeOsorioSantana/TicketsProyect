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
// Evento de envío del formulario
document.getElementById('sessionForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('sessionTitle').value;
  const description = document.getElementById('sessionDescription').value;
  const startTime = document.getElementById('sessionStartTime').value;
  const endTime = document.getElementById('sessionEndTime').value;
  const speakerName = document.getElementById('speakerName').value;
  const speakerBio = document.getElementById('speakerBio').value;
  const eventName = document.getElementById('eventName').value;

  if (!title || !description || !startTime || !endTime || !speakerName || !speakerBio || !eventName) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    const getRes = await fetch(`http://localhost:8080/api/sessions/name/${encodeURIComponent(eventName)}`);

    if (!getRes.ok) {
      const error = await getRes.json();
      alert(`Error: ${error.message || "Evento no encontrado."}`);
      return;
    }

    const sessionData = { title, description, startTime, endTime, speakerName, speakerBio };

    const postRes = await fetch(`http://localhost:8080/api/sessions/${encodeURIComponent(eventName)}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });

    if (!postRes.ok) {
      const errorMessage = await postRes.json();
      throw new Error(errorMessage.message || "Hubo un problema al crear la sesión.");
    }

    alert("¡Sesión creada con éxito!");
    this.reset();

  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});