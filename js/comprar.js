document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  const titleElement = document.getElementById("eventTitle");
  const detailsContainer = document.getElementById("eventDetails");
  const compraSection = document.getElementById("compraForm");
  const mensajeCompra = document.getElementById("mensajeCompra");

  if (!eventId) {
    detailsContainer.innerHTML = "<p>❌ ID de evento no especificado.</p>";
    return;
  }

  // Cargar detalles del evento
  fetch(`http://localhost:8080/api/public/events/${eventId}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  })
    .then(res => res.json())
    .then(evento => {
      titleElement.textContent = evento.name;

      detailsContainer.innerHTML = `
        <img src="${evento.imagen?.url || 'https://source.unsplash.com/800x400/?ticket'}" 
             alt="Imagen del evento" class="event-img" />
        <p><strong>📅 Fecha:</strong> ${evento.startDate} - ${evento.endDate}</p>
        <p><strong>📍 Lugar:</strong> ${evento.address}</p>
        <p><strong>🗺️ Coordenadas:</strong> ${evento.latitude}, ${evento.longitude}</p>
        <p><strong>📄 Descripción:</strong> ${evento.description}</p>
      `;

      compraSection.style.display = "block";
    })
    .catch(error => {
      console.error("Error al cargar el evento:", error);
      detailsContainer.innerHTML = "<p>⚠️ No se pudo cargar la información del evento.</p>";
    });

  // Confirmar compra
  const form = document.getElementById("formCompra");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const compra = {
      eventId: parseInt(eventId),
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      cantidad: parseInt(form.cantidad.value)
    };

    // Aquí se puede hacer el fetch al backend real para registrar la compra
    try {
      // Simulación de compra exitosa
      mensajeCompra.textContent = `✅ ¡Gracias ${compra.nombre}! Se han comprado ${compra.cantidad} entradas para el evento.`;
      mensajeCompra.style.color = "green";
      form.reset();
    } catch (error) {
      mensajeCompra.textContent = "❌ Error al procesar la compra.";
      mensajeCompra.style.color = "red";
    }
  });
});
