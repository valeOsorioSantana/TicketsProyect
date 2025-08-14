document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recommendedEvents");

  const userId = localStorage.userId; // Asegúrate de que el ID del usuario esté guardado en localStorage

  if (!userId) {
    container.innerHTML = `<p>⚠️ Debes iniciar sesión para ver recomendaciones.</p>`;
    return;
  }

  fetch(`https://ticket-backend-bkkf.onrender.com/api/recommendations/${userId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al obtener recomendaciones");
      }
      return response.json();
    })
    .then(data => {
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = `<p>No hay recomendaciones disponibles en este momento.</p>`;
        return;
      }

      data.forEach(evento => renderizarCard(evento, container));
    })
    .catch(error => {
      container.innerHTML = `<p class="error">⚠️ Error cargando recomendaciones: ${error.message}</p>`;
      console.error("Error:", error);
    });
});
