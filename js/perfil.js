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

document.addEventListener('DOMContentLoaded', function () {
    async function obtenerPerfil() {
        try {
            const token = localStorage.getItem('token');
            const idUser = localStorage.getItem('userId');

            if (!token || token.split('.').length !== 3 || !idUser) {
                alert("Sesión inválida. Inicia sesión nuevamente.");
                localStorage.clear();
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch(`https://ticket-backend-bkkf.onrender.com/api/users/${idUser}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener perfil: ${response.status}`);
            }

            const perfil = await response.json();
            console.log('Perfil cargado:', perfil);

            // Rellenar campos del formulario
            document.getElementById('email').value = perfil.email || '';
            document.getElementById('name').value = perfil.name || '';
            document.getElementById('lastName').value = perfil.lastName || '';
            document.getElementById('phone').value = perfil.phone || '';
            document.getElementById('city').value = perfil.city || '';
            document.getElementById('bio').value = perfil.bio || '';
            document.getElementById('avatarUrl').value = perfil.avatarUrl || '';
            document.getElementById('role').value = perfil.role || '';
            document.getElementById('estado').checked = perfil.estado;

        } catch (error) {
            console.error('Error al obtener el perfil:', error);
            alert('Error al cargar los datos del perfil.');
        }
    }

    obtenerPerfil();

    // Envío del formulario
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || token.split('.').length !== 3 || !userId) {
                alert("Sesión inválida. Inicia sesión nuevamente.");
                localStorage.clear();
                window.location.href = '/login.html';
                return;
            }

            const password = document.getElementById('password')?.value.trim() || '';

            if (!password) {
                alert("La contraseña es obligatoria.");
                return;
            }

            const datosActualizados = {
                email: document.getElementById('email')?.value.trim() || '',
                passwordHash: password,
                name: document.getElementById('name')?.value.trim() || '',
                lastName: document.getElementById('lastName')?.value.trim() || '',
                phone: document.getElementById('phone')?.value.trim() || '',
                city: document.getElementById('city')?.value.trim() || '',
                bio: document.getElementById('bio')?.value.trim() || '',
                avatarUrl: document.getElementById('avatarUrl')?.value.trim() || '',
                role: document.getElementById('role')?.value.trim() || 'USER',
                estado: document.getElementById('estado')?.checked || false
            };

            try {
                const response = await fetch(`https://ticket-backend-bkkf.onrender.com/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizados)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }

                alert('✅ Perfil actualizado correctamente.');

            } catch (error) {
                console.error('❌ Error al actualizar el perfil:', error);
                alert('Error al guardar los cambios del perfil.');
            }
        });
    }
});
