document.addEventListener('DOMContentLoaded', function () {

    async function obtenerPerfil() {
        try {
            const token = localStorage.getItem('token');

            if (!token || token.split('.').length !== 3) {
                alert("Sesión inválida. Inicia sesión nuevamente.");
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch('http://localhost:8080/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Respuesta inesperada:', response.status, errorText);

                if (response.status === 401 || response.status === 403) {
                    alert("Sesión expirada o inválida. Por favor, vuelve a iniciar sesión.");
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                } else {
                    alert(`Error ${response.status}: ${errorText || 'No se pudo obtener el perfil.'}`);
                }
                return;
            }

            if (!contentType.includes('application/json')) {
                const text = await response.text();
                console.warn('La respuesta no es JSON:', text);
                alert('La respuesta del servidor no es válida.');
                return;
            }

            const perfil = await response.json();
            console.log('Perfil cargado:', perfil);

            // Verifica que los elementos existen antes de acceder
            const campos = ['email', 'firstName', 'lastName', 'phone', 'city', 'bio'];
            campos.forEach(id => {
                const campo = document.getElementById(id);
                if (campo) campo.value = perfil[id] || '';
            });

        } catch (error) {
            console.error('Error al obtener el perfil:', error);
            alert('Error al cargar los datos del perfil.');
        }
    }

    obtenerPerfil();

    // Manejo del envío del formulario
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email')?.value.trim() || '';
            const firstName = document.getElementById('firstName')?.value.trim() || '';
            const lastName = document.getElementById('lastName')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';
            const city = document.getElementById('city')?.value.trim() || '';
            const bio = document.getElementById('bio')?.value.trim() || '';

            const datosActualizados = { email, firstName, lastName, phone, city, bio };

            try {
                const token = localStorage.getItem('token');

                if (!token || token.split('.').length !== 3) {
                    alert("No se encontró un token válido. Por favor, inicia sesión nuevamente.");
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }

                const response = await fetch('http://localhost:8080/api/users/me', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizados)
                });

                const contentType = response.headers.get('content-type') || '';

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error al actualizar:', response.status, errorText);

                    if (response.status === 401 || response.status === 403) {
                        alert("Tu sesión ha expirado. Inicia sesión de nuevo.");
                        localStorage.removeItem('token');
                        window.location.href = '/login.html';
                    } else {
                        alert(`Error ${response.status}: ${errorText || 'No se pudo actualizar el perfil.'}`);
                    }
                    return;
                }

                if (contentType.includes('application/json')) {
                    await response.json(); // No usamos el cuerpo, pero evitamos advertencias
                }

                alert('Perfil actualizado correctamente.');

            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                alert('Error al guardar los cambios del perfil.');
            }
        });
    }
});
