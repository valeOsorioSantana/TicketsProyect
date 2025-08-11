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

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem('userId') || 2;
  const container = document.getElementById("favoritosContainer");

  if (!userId) {
    container.innerHTML = "<p>⚠️ No se encontró el usuario.</p>";
    return;
  }

  fetch(`https://ticket-backend-bkkf.onrender.com/api/usuarios/${userId}/favoritos`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener eventos favoritos");
      return res.json();
    })
    .then(favoritos => {
      if (!favoritos.length) {
        container.innerHTML = "<p style='text-align:center;'>🤷‍♀️ Aún no has guardado ningún evento como favorito.</p>";
        return [];
      }

      // Si hay favoritos, traer sus datos completos (incluyendo imagenes)
      return Promise.all(favoritos.map(ev =>
        fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/${ev.id}`)
          .then(r => {
            if (!r.ok) throw new Error(`Error cargando evento con ID ${ev.id}`);
            return r.json();
          })
      ));
    })
    .then(eventosConImagen => {
      // Si retornamos [] porque no había favoritos, evitamos hacer nada más
      if (!eventosConImagen.length) return;

      container.innerHTML = "";

      eventosConImagen.forEach(evento => {
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
              <a class="main-btn" href="infoEvent.html?id=${evento.id}">Ver detalles</a>
            </div>
          </div>
          <button class="btn-favorito-card" title="Quitar de favoritos" aria-label="Quitar de favoritos">♥</button>
        `;

        const btnQuitar = card.querySelector(".btn-favorito-card");
        btnQuitar.addEventListener("click", () => {
          fetch(`https://ticket-backend-bkkf.onrender.com/api/usuarios/${userId}/favoritos/${evento.id}`, {
            method: 'DELETE'
          })
            .then(res => {
              if (!res.ok) throw new Error("Error al eliminar favorito");
              card.remove();

              if (container.children.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>🤷‍♀️ No tienes más eventos favoritos.</p>";
              }
            })
            .catch(err => {
              alert("No se pudo eliminar el favorito");
              console.error(err);
            });
        });

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error cargando eventos favoritos:", err);
      container.innerHTML = `<p>⚠️ Ocurrió un error al cargar tus eventos favoritos.</p>`;
    });
});
