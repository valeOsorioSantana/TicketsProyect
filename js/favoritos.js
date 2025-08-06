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

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem('userId');
    const favoritos = JSON.parse(localStorage.getItem("eventosFavoritos")) || [];
    const container = document.getElementById("favoritosContainer");

    if (!favoritos.length) {
        container.innerHTML = "<p style='text-align:center;'>🤷‍♀️ Aún no has guardado ningún evento como favorito.</p>";
        return;
    }

    // Obtener los eventos
    Promise.all(
        favoritos.map(id =>
            fetch(`http://localhost:8080/api/public/events/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Error al obtener evento con ID " + id);
                    return res.json();
                })
        )
    )
        .then(eventos => {
            container.innerHTML = ""; // Limpiar loader

            eventos.forEach(evento => {
                const card = document.createElement("div");
                card.classList.add("evento-card");

                const imagenEvento = evento.imagenes?.find(img =>
                    img.url && img.url.includes("/imagenes/") && !img.url.includes("Error")
                );
                const imagenUrl = imagenEvento?.url || "https://source.unsplash.com/800x400/?concert";

                card.innerHTML = `
  <img src="${imagenUrl}" alt="Imagen del evento" />
  <div class="content">
    <h3>${evento.name}</h3>
    <p><strong>📍 Dirección:</strong> ${evento.address}</p>
    <p><strong>📅 Fecha:</strong> ${new Date(evento.startDate).toLocaleDateString('es-CO')}</p>
    <div class="actions">
      <a class="main-btn" href="detallesEvento.html?id=${evento.id}">Ver detalles</a>
    </div>
  </div>
  <button class="btn-favorito-card" title="Quitar de favoritos" aria-label="Quitar de favoritos">♥</button>
`;


                // Botón quitar favorito
                const btnQuitar = card.querySelector(".btn-favorito-card");
                btnQuitar.addEventListener("click", () => {
                    let favoritos = JSON.parse(localStorage.getItem("eventosFavoritos")) || [];
                    favoritos = favoritos.filter(id => id !== evento.id);
                    localStorage.setItem("eventosFavoritos", JSON.stringify(favoritos));
                    card.remove();

                    if (favoritos.length === 0) {
                        container.innerHTML = "<p style='text-align:center;'>🤷‍♀️ No tienes más eventos favoritos.</p>";
                    }
                });

                container.appendChild(card);
            });
        })
        .catch(err => {
            container.innerHTML = `<p>⚠️ Ocurrió un error al cargar tus eventos favoritos.</p>`;
            console.error(err);
        });
});
