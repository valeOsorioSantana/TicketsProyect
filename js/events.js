// Call the dataTables jQuery plugin
$(document).ready(function () {

  cargarUsuarios()

  $('#usuarios').DataTable();
  checkAuthentication();
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

async function cargarUsuarios() {
  const request = await fetch('http://localhost:8080/api/public/events/', {
    method: 'GET',
    headers: {
      "Accept": "application/json"
    },
  });

  const eventos = await request.json();
  let listadoHtml = "";

  for (let evento of eventos) {
    if (evento.status === "FINALIZADO") continue;

    const botonEliminar = `
      <button class="btn btn-outline-danger btn-sm" title="Eliminar" onclick="eliminarEvento(${evento.id})">
        <i class="fas fa-trash"></i>
      </button>`;

    const botonEditar = `
      <button class="btn btn-outline-warning btn-sm me-2" title="Editar" onclick="redirigirActualizar(${evento.id})">
        <i class="fas fa-pen"></i>
      </button>`;

    const botonEstadisticas = `
      <button class="btn btn-outline-info btn-sm" title="Ver estadísticas" onclick="verEstadisticas(${evento.id})">
        <i class="fas fa-chart-bar"></i>
      </button>`;

    const precio = evento.ticketPrice !== undefined && evento.ticketPrice !== null
      ? `$${parseFloat(evento.ticketPrice).toFixed(2)}`
      : `<span class="text-muted">No asignado</span>`;

    let imagenEvento = evento.imagenes?.find(img => img.url && img.url.includes("/imagenes/") && !img.url.includes("Error"));
    let imagenUrl = imagenEvento?.url || "https://via.placeholder.com/100x60?text=Sin+Imagen";

    const eventoHtml = `
    <tr data-id="${evento.id}" data-lat="${evento.latitude}" data-lng="${evento.longitude}">
      <td><img src="${imagenUrl}" alt="Portada" width="100" height="60" style="object-fit:cover; border-radius:4px;"></td>
      <td>${evento.name}</td>
      <td>${evento.description}</td>
      <td>${evento.category}</td>
      <td>${precio}</td>
      <td>${evento.address}</td>
      <td>${evento.startDate}</td>
      <td>${evento.endDate}</td>
      <td><span class="badge bg-success text-white">${evento.status}</span></td>
      <td>${botonEditar} ${botonEliminar} ${botonEstadisticas}</td>
    </tr>`;

    listadoHtml += eventoHtml;
  }

  document.querySelector('#usuarios tbody').outerHTML = listadoHtml;
}

function redirigirActualizar(id) {
  if (!confirm('¿Desea editar este evento?')) {
    return;
  }

  window.location.href = `editEvents.html?id=${id}`;
}

function getHeaders() {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': localStorage.token
  };
}

async function eliminarEvento(id) {
  if (!confirm('¿Está seguro de que desea eliminar este evento?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/public/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (response.ok) {
      // Eliminar visualmente la fila de la tabla
      const fila = document.querySelector(`tr[data-id="${id}"]`);
      if (fila) fila.remove();
      alert('✅ Evento eliminado correctamente.');
    } else {
      const error = await response.text();
      alert('❌ Error al eliminar el evento: ' + error);
    }
  } catch (err) {
    console.error('Error de red:', err);
    alert('❌ Error de red al intentar eliminar el evento.');
  }
}

function verEstadisticas(id) {
  window.location.href = `estadisticas.html?id=${id}`;
}