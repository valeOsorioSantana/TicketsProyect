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

// Helper para mostrar mensaje
function showMessage(msg, color = 'red') {
    messageDiv.style.color = color;
    messageDiv.textContent = msg;
}

// Vista inicial: pedir email
recoverForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    showMessage('');

    if (!email) {
        showMessage('Por favor ingresa un correo válido.');
        return;
    }

    try {
        const url = `http://localhost:8080/api/recuperacion/solicitar?email=${encodeURIComponent(email)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${tokenAuth}`
            },
        });

        if (response.ok) {
            showMessage('Se ha enviado un enlace de recuperación a tu correo.', 'green');
            storedEmail = email;

            // Cambiar a vista validar token
            viewRequest.style.display = 'none';
            viewValidate.style.display = 'block';
            viewReset.style.display = 'none';
        } else {
            const data = await response.json();
            showMessage(data.error || 'Error al enviar el enlace. Intenta nuevamente.');
        }
    } catch {
        showMessage('Error de conexión. Por favor intenta más tarde.');
    }
});

// Vista validar token
validateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const token = document.getElementById('token').value.trim();
    showMessage('');

    if (!token) {
        showMessage('Por favor ingresa el token recibido.');
        return;
    }

    try {
        const url = `http://localhost:8080/api/recuperacion/validar?email=${encodeURIComponent(storedEmail)}&token=${encodeURIComponent(token)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${tokenAuth}`
            },
        });

        if (response.ok) {
            showMessage('Token válido. Ahora puedes cambiar tu contraseña.', 'green');
            storedToken = token;

            // Cambiar a vista cambiar contraseña
            viewRequest.style.display = 'none';
            viewValidate.style.display = 'none';
            viewReset.style.display = 'block';
        } else {
            const data = await response.json();
            showMessage(data.error || 'Token inválido o expirado.');
        }
    } catch {
        showMessage('Error de conexión. Por favor intenta más tarde.');
    }
});

// Vista cambiar contraseña
resetForm.addEventListener('submit', async e => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    showMessage('');

    if (!newPassword || !confirmPassword) {
        showMessage('Por favor completa todos los campos.');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('Las contraseñas no coinciden.');
        return;
    }

    try {

        const url = `http://localhost:8080/api/recuperacion/cambiar?token=${encodeURIComponent(storedToken)}&nuevaPassword=${encodeURIComponent(newPassword)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${tokenAuth}`
            }
        });

        if (!storedEmail || !storedToken) {
            showMessage('Faltan datos para completar la recuperación. Intenta de nuevo desde el inicio.');
            return;
        }

        if (response.ok) {
            showMessage('Contraseña cambiada con éxito. Ya puedes iniciar sesión.', 'green');
            resetForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            const data = await response.json();
            showMessage(data.error || 'Error al cambiar la contraseña.');
        }
    } catch {
        showMessage('Error de conexión. Por favor intenta más tarde.');
    }
});
