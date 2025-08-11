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
    window.location.href = 'index.html'
  }
}

function logout() {
  // Eliminar el token del localStorage
  localStorage.removeItem('token'); // Asegúrate de usar la clave que usaste para guardar el token
  localStorage.removeItem('email');
  localStorage.removeItem('nombre');
  // Redirigir al usuario a la página de inicio de sesión o a otra página

  window.location.href = 'index.html'
}

function actualizarEmailDelUsuario() {
  document.getElementById('txt-name-usuario').outerHTML = localStorage.nombre;
}

async function registrarUsuario() {
  const datos = {
    name: document.getElementById('txtName').value,
    lastName: document.getElementById('txtLastName').value,
    phone: document.getElementById('txtPhone').value,
    city: document.getElementById('txtCity').value,
    bio: document.getElementById('txtBio').value,
    email: document.getElementById('txtEmail').value,
    password: document.getElementById('txtPassword').value,
  };

  const repetirPassword = document.getElementById('txtRepetirPassword').value;
  if (repetirPassword !== datos.password) {
    alert('La contraseña que escribiste es diferente.');
    return;
  }

  const rolSeleccionado = document.getElementById('selectRole').value; // "true" o "false"
  const url = `https://ticket-backend-bkkf.onrender.com/api/users/${rolSeleccionado}`;

  try {
    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    if (request.ok) {
      alert("La cuenta fue creada con éxito!");
      window.location.href = 'login.html';
    } else {
      const errorData = await request.json();
      alert(errorData.message || "Error al crear el usuario.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor.");
  }
}
