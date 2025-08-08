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
