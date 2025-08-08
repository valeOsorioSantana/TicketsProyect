const messageDiv = document.getElementById('message');

const viewRequest = document.getElementById('view-request');
const viewValidate = document.getElementById('view-validate');
const viewReset = document.getElementById('view-reset');

const recoverForm = document.getElementById('recoverForm');
const validateForm = document.getElementById('validateForm');
const resetForm = document.getElementById('resetForm');

let storedEmail = '';
let storedToken = '';

const tokenAuth = 'eyJhbGciOiJIUzUxMiJ9.eyJuYW1lIjoidmFsZSIsImVtYWlsIjoidmFsZW9zb3NhbnRhbmEwQGdtYWlsLmNvbSIsIlJvbCI6IlVTRVIiLCJzdWIiOiJ2YWxlb3Nvcmlvc2FudGFuYTBAZ21haWwuY29tIiwiaWF0IjoxNzUzMzI3NjAzLCJleHAiOjE3NTM0MTQwMDN9.Org1lV6K9MxpHY7UCe_WhjuErEdl8jazszSiU5g4CVb9SOssUf0T0VL8Kxd1rbyYy_zpzFVDZWPvdfHquUj7nQ';

// Mostrar mensaje
function showMessage(msg, color = 'red') {
  messageDiv.textContent = msg;
  messageDiv.style.color = color;
}

// Vista 1: Solicitar email
recoverForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  showMessage('');

  if (!email) return showMessage('Por favor ingresa un correo válido.');

  try {
    const url = `https://ticket-backend-bkkf.onrender.com/api/recuperacion/solicitar?email=${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenAuth}`
      }
    });

    if (response.ok) {
      storedEmail = email;
      showMessage('Se ha enviado un enlace de recuperación a tu correo.', 'green');
      viewRequest.style.display = 'none';
      viewValidate.style.display = 'block';
    } else {
      const data = await response.json();
      showMessage(data.message || 'Error al enviar el enlace. Intenta nuevamente.');
    }
  } catch {
    showMessage('Error de conexión. Por favor intenta más tarde.');
  }
});

// Vista 2: Validar token
validateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = document.getElementById('token').value.trim();
  showMessage('');

  if (!token) return showMessage('Por favor ingresa el token recibido.');

  try {
    const url = `https://ticket-backend-bkkf.onrender.com/api/recuperacion/validar?email=${encodeURIComponent(storedEmail)}&token=${encodeURIComponent(token)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenAuth}`
      }
    });

    if (response.ok) {
      storedToken = token;
      showMessage('Token válido. Ahora puedes cambiar tu contraseña.', 'green');
      viewValidate.style.display = 'none';
      viewReset.style.display = 'block';
    } else {
      const data = await response.json();
      showMessage(data.message || 'Token inválido o expirado.');
    }
  } catch {
    showMessage('Error de conexión. Por favor intenta más tarde.');
  }
});

// Vista 3: Cambiar contraseña
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  showMessage('');

  if (!newPassword || !confirmPassword)
    return showMessage('Por favor completa todos los campos.');

  if (newPassword !== confirmPassword)
    return showMessage('Las contraseñas no coinciden.');

  if (!storedToken || !storedEmail)
    return showMessage('Faltan datos para completar la recuperación. Intenta de nuevo desde el inicio.');

  try {
    const url = `https://ticket-backend-bkkf.onrender.com/api/recuperacion/cambiar?token=${encodeURIComponent(storedToken)}&nuevaPassword=${encodeURIComponent(newPassword)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenAuth}`
      }
    });

    if (response.ok) {
      showMessage('Contraseña cambiada con éxito. Redirigiendo...', 'green');
      resetForm.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    } else {
      const data = await response.json();
      showMessage(data.message || 'Error al cambiar la contraseña.');
    }
  } catch {
    showMessage('Error de conexión. Por favor intenta más tarde.');
  }
});
