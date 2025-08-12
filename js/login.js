$(document).ready(function () {
  // on ready
});

async function iniciarSesion() {
  let datos = {
    email: document.getElementById('txtEmail').value,
    password: document.getElementById('txtPassword').value
  };

  try {
    const request = await fetch('https://ticket-backend-bkkf.onrender.com/auth/login', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    const respuesta = await request.json();

    if (request.ok && respuesta.token) {
      const tokenData = jwt_decode(respuesta.token);

      localStorage.setItem('token', respuesta.token);
      localStorage.setItem('email', tokenData.sub);
      localStorage.setItem('nombre', tokenData.name);
      localStorage.setItem('rol', tokenData.Rol || '');
      localStorage.setItem('userId', tokenData.id);

      if (!tokenData.Rol === 'ADMIN') {
        window.location.href = 'index.html';
      } else {
        window.location.href = 'events.html';
      }

    } else {
      if (respuesta.error && respuesta.error.toLowerCase().includes("no encontrado")) {
        if (confirm("El usuario no está registrado. ¿Desea registrarse ahora?")) {
          window.location.href = "registro.html";
        }
      } else {
        alert(respuesta.error || "Error de autenticación.");
      }
    }

  } catch (error) {
    console.error("Error en la solicitud:", error);
    alert("No se pudo conectar con el servidor.");
  }
}
