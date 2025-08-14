document.addEventListener("DOMContentLoaded", () => {
  const btnBuscar = document.getElementById("buscarEventos");
  const contenedor = document.getElementById("eventosCercanosList");

  btnBuscar.addEventListener("click", () => {
    if (!navigator.geolocation) {
      contenedor.innerHTML = "<p>La geolocalización no está soportada por tu navegador.</p>";
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const radius = 5000; // en metros

      try {
        const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
        
        if (!res.ok) throw new Error("Error al obtener eventos cercanos");

        const eventos = await res.json();

        contenedor.innerHTML = "";

        if (eventos.length === 0) {
          contenedor.innerHTML = "<p>No hay eventos cercanos en tu zona.</p>";
          return;
        }

        eventos.forEach(evento => {
          const div = document.createElement("div");
          div.className = "evento";

          div.innerHTML = `
            <h3>${evento.name}</h3>
            <p><strong>Dirección:</strong> ${evento.address}</p>
            <p><strong>Fecha:</strong> ${new Date(evento.startDate).toLocaleString()}</p>
            <p><strong>Categoría:</strong> ${evento.category}</p>
            <p><strong>Precio:</strong> $${evento.ticketPrice}</p>
          `;

          contenedor.appendChild(div);
        });

      } catch (err) {
        contenedor.innerHTML = `<p>Error: ${err.message}</p>`;
      }
    }, (error) => {
      contenedor.innerHTML = `<p>No se pudo obtener tu ubicación: ${error.message}</p>`;
    });
  });
});
