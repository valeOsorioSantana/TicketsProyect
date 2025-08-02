document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const rawUserId = localStorage.getItem("userId");
  const userId = rawUserId ? parseInt(rawUserId) : null;

  const titleElement = document.getElementById("eventTitle");
  const detailsContainer = document.getElementById("eventDetails");
  const compraSection = document.getElementById("compraForm");
  const mensajeCompra = document.getElementById("mensajeCompra");

  const cantidadInput = document.getElementById("cantidad");
  const ticketTypeSelect = document.getElementById("ticketType");
  const seatingMapContainer = document.getElementById("seatingMapContainer");
  const seatingMapImage = document.getElementById("seatingMapImage");

  const pagoSection = document.getElementById("pagoForm");
  const formPago = document.getElementById("formPago");
  const mensajePago = document.getElementById("mensajePago");
  const resumenPago = document.getElementById("resumenPago");

  // Inputs ocultos para el pago
  const amountInput = document.createElement("input");
  amountInput.type = "hidden";
  amountInput.id = "amount";
  formPago.appendChild(amountInput);

  let registro = null;
  let evento = null;

  if (!eventId || !userId || isNaN(userId)) {
    const razones = [];
    if (!eventId) razones.push("ID del evento");
    if (!userId || isNaN(userId)) razones.push("ID del usuario");
    detailsContainer.innerHTML = `<p>❌ Falta: ${razones.join(" y ")}.</p>`;
    return;
  }

  // Precios según tipo de entrada
  const preciosPorTipo = {
    General: 50,
    VIP: 100,
    Platino: 150
  };

  try {
    // Cargar datos del evento
    const res = await fetch(`http://localhost:8080/api/public/events/${eventId}`);
    if (!res.ok) throw new Error("No se encontró el evento");
    evento = await res.json();

    titleElement.textContent = evento.name;

    const inicio = new Date(evento.startDate);
    const fin = new Date(evento.endDate);
    const ahora = new Date();

    const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const opcionesHora = { hour: "2-digit", minute: "2-digit", hour12: true };

    const fechaInicio = `${inicio.toLocaleDateString("es-ES", opcionesFecha)} a las ${inicio.toLocaleTimeString("es-ES", opcionesHora)}`;
    const fechaFin = `${fin.toLocaleDateString("es-ES", opcionesFecha)} a las ${fin.toLocaleTimeString("es-ES", opcionesHora)}`;
    const eventoFinalizado = fin < ahora;

    const imagenEvento = evento.imagenes?.find(img => img.url?.includes("/imagenes/"));
    const imagenMapa = evento.imagenes?.find(img => img.url?.includes("/mapas/"));
    const imagenPrincipalUrl = imagenEvento?.url || 'https://source.unsplash.com/800x400/?ticket';

    detailsContainer.innerHTML = `
      <img src="${imagenPrincipalUrl}" alt="Imagen del evento" class="event-img" style="max-width: 100%; margin-bottom: 15px;" />
      <p><strong>📅 Fecha de inicio:</strong> ${fechaInicio}</p>
      <p><strong>🕓 Fecha de finalización:</strong> ${fechaFin}</p>
      <p><strong>📍 Lugar:</strong> ${evento.address}</p>
      <p><strong>📄 Descripción:</strong> ${evento.description}</p>
      ${eventoFinalizado ? '<p class="text-danger"><strong>⚠️ Este evento ya finalizó.</strong></p>' : ''}
    `;

    if (imagenMapa?.url) {
      seatingMapImage.src = imagenMapa.url;
      seatingMapContainer.style.display = "block";
    }

    if (eventoFinalizado) return;

    // Buscar registro existente del usuario para este evento
    const regRes = await fetch(`http://localhost:8080/api/registrations/user/${userId}`);
    if (!regRes.ok) throw new Error("Error al obtener registros");
    const registros = await regRes.json();
    registro = registros.find(r => r.eventId === parseInt(eventId));

    compraSection.style.display = "block";
    pagoSection.style.display = "block";

    if (registro) {
      // Verificar si ya existe un pago
      const pagoRes = await fetch(`http://localhost:8080/api/payments/registration/${registro.id}`);
      if (pagoRes.ok) {
        const pagoExistente = await pagoRes.json();

        mensajePago.innerHTML = `
    <span style="color: blue;">
      ℹ️ Ya existe un pago registrado para esta inscripción.<br>
      Método: <strong>${pagoExistente.method}</strong><br>
      Monto: <strong>$${pagoExistente.amount.toFixed(2)}</strong>
    </span><br>`;

        // Crear botón para nueva inscripción
        const btnNuevaInscripcion = document.createElement("button");
        btnNuevaInscripcion.textContent = "🔄 Crear nueva inscripción";
        btnNuevaInscripcion.className = "btn btn-primary mt-2";
        mensajePago.appendChild(btnNuevaInscripcion);

        btnNuevaInscripcion.addEventListener("click", () => {
          registro = null; // Reset registro actual
          mensajePago.innerHTML = "";
          mensajeCompra.innerHTML = "<span style='color: orange;'>⚠️ Se va a crear una nueva inscripción.</span>";

          cantidadInput.value = 1;
          ticketTypeSelect.value = "General";

          formPago.style.display = "block";
          compraSection.style.display = "block";

          actualizarResumenPago();
        });

        formPago.style.display = "none";
        return;
      }

      // Asignar valores del registro al formulario
      cantidadInput.value = registro.quantity || 1;
      if (registro.ticketType && preciosPorTipo[registro.ticketType]) {
        ticketTypeSelect.value = registro.ticketType;
      } else {
        ticketTypeSelect.value = "General";
      }
    } else {
      cantidadInput.value = 1;
      ticketTypeSelect.value = "General";
      mensajeCompra.innerHTML = `
        <span style="color: orange;">
          ⚠️ No tiene inscripción previa para este evento. Se creará automáticamente al pagar.
        </span>`;
    }

    actualizarResumenPago();

    // Actualizar resumen al cambiar cantidad o tipo
    cantidadInput.addEventListener("input", actualizarResumenPago);
    ticketTypeSelect.addEventListener("change", actualizarResumenPago);

  } catch (error) {
    console.error("❌ Error al cargar datos:", error);
    detailsContainer.innerHTML = "<p>⚠️ No se pudo cargar la información.</p>";
  }

  function actualizarResumenPago() {
    const cantidad = parseInt(cantidadInput.value || "1");
    const tipo = ticketTypeSelect.value || "General";
    const precioUnitario = preciosPorTipo[tipo] || 50;
    const total = precioUnitario * cantidad;

    resumenPago.innerHTML = `
      Entradas: <strong>${cantidad}</strong><br>
      Tipo: <strong>${tipo}</strong><br>
      Precio por entrada: <strong>$${precioUnitario.toFixed(2)}</strong><br>
      <strong>Total a pagar: $${total.toFixed(2)}</strong>
    `;
    amountInput.value = total.toFixed(2);
  }

  formPago?.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajePago.textContent = "";

    const amountValue = parseFloat(amountInput.value);
    const methodValue = document.getElementById("method").value?.trim();
    const cantidadNueva = parseInt(cantidadInput.value || "1");
    const ticketTypeValue = ticketTypeSelect.value;

    if (!amountValue || !methodValue) {
      mensajePago.textContent = "❌ Faltan datos para procesar el pago.";
      mensajePago.style.color = "red";
      return;
    }

    try {
      // Siempre crear un nuevo registro al pagar
      const nuevaInscripcion = {
        users: { id: userId },
        events: { id: parseInt(eventId) },
        quantity: cantidadNueva,
        ticketType: ticketTypeValue
      };

      const resRegistro = await fetch("http://localhost:8080/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevaInscripcion)
      });

      if (!resRegistro.ok) throw new Error("Error al crear la inscripción");
      registro = await resRegistro.json();

      // Enviar pago
      const pago = {
        registrationId: registro.id,
        method: methodValue,
        amount: amountValue
      };

      const resPago = await fetch("http://localhost:8080/api/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(pago)
      });

      if (!resPago.ok) {
        const errorText = await resPago.text();
        console.error("Detalles del error:", errorText);

        if (errorText.includes("ya existe un pago")) {
          mensajePago.textContent = "ℹ️ Ya existe un pago registrado para esta inscripción.";
          mensajePago.style.color = "blue";
          formPago.style.display = "none";
        } else {
          throw new Error("Error al crear el pago");
        }
        return;
      }

      mensajePago.textContent = "💰 ¡Pago registrado exitosamente!";
      mensajePago.style.color = "green";
      formPago.reset();
      formPago.style.display = "none";
      compraSection.style.display = "none";

    } catch (error) {
      console.error("❌ Error al procesar el pago:", error.message);
      mensajePago.textContent = "❌ Error al registrar el pago.";
      mensajePago.style.color = "red";
    }
  });
});
