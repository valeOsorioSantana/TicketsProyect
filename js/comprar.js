document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  const titleElement = document.getElementById("eventTitle");
  const detailsContainer = document.getElementById("eventDetails");
  const compraSection = document.getElementById("compraForm");
  const mensajeCompra = document.getElementById("mensajeCompra");

  const seatingMapContainer = document.getElementById("seatingMapContainer");
  const seatingMapImage = document.getElementById("seatingMapImage");

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

      // Fechas formateadas
      const inicio = new Date(evento.startDate);
      const fin = new Date(evento.endDate);
      const ahora = new Date();

      const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const opcionesHora = { hour: "2-digit", minute: "2-digit", hour12: true };

      const fechaInicio = `${inicio.toLocaleDateString("es-ES", opcionesFecha)} a las ${inicio.toLocaleTimeString("es-ES", opcionesHora)}`;
      const fechaFin = `${fin.toLocaleDateString("es-ES", opcionesFecha)} a las ${fin.toLocaleTimeString("es-ES", opcionesHora)}`;
      const eventoFinalizado = fin < ahora;

      // Mostrar imagen del evento o imagen por defecto
      detailsContainer.innerHTML = `
        <img src="${evento.imagen?.url || 'https://source.unsplash.com/800x400/?ticket'}"
             alt="Imagen del evento" class="event-img" />
        <p><strong>📅 Fecha de inicio:</strong> ${fechaInicio}</p>
        <p><strong>🕓 Fecha de finalización:</strong> ${fechaFin}</p>
        <p><strong>📍 Lugar:</strong> ${evento.address}</p>
        <p><strong>📄 Descripción:</strong> ${evento.description}</p>
        ${eventoFinalizado ? '<p class="text-danger"><strong>⚠️ Este evento ya finalizó.</strong></p>' : ''}
      `;

      // Mostrar mapa del estadio si existe
      if (evento.seatingMapImageUrl) {
        seatingMapImage.src = evento.seatingMapImageUrl;
        seatingMapContainer.style.display = "block";
      } else {
        seatingMapContainer.style.display = "none";
      }

      // Mostrar u ocultar formulario según si el evento ya terminó
      compraSection.style.display = eventoFinalizado ? "none" : "block";
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
