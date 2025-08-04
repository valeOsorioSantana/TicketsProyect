document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const rawUserId = localStorage.getItem("userId");
  const userId = rawUserId ? parseInt(rawUserId) : null;

  const titleElement = document.getElementById("eventTitle");
  const detailsContainer = document.getElementById("eventDetails");
  const seatingMapContainer = document.getElementById("seatingMapContainer");
  const seatingMapImage = document.getElementById("seatingMapImage");

  const formPago = document.getElementById("formPago");
  const ticketTypeSelect = document.getElementById("ticketType");
  const cantidadInput = document.getElementById("cantidad");
  const methodInput = document.getElementById("method");
  const resumenPago = document.getElementById("resumenPago");
  const amountInput = document.getElementById("amount");
  const mensajePago = document.getElementById("mensajePago");

  const cardFields = document.getElementById("cardFields");
  const pseFields = document.getElementById("pseFields");
  const paypalFields = document.getElementById("paypalFields");

  methodInput.addEventListener("change", () => {
    const metodo = methodInput.value;

    const esTarjeta = metodo === "Tarjeta de crédito" || metodo === "Tarjeta de débito";
    const esPSE = metodo === "PSE";
    const esPayPal = metodo === "PayPal";

    document.getElementById("cardFields").style.display = esTarjeta ? "block" : "none";
    document.getElementById("pseFields").style.display = esPSE ? "block" : "none";
    document.getElementById("paypalFields").style.display = esPayPal ? "block" : "none";

    // Quitar required de todo
    document.querySelectorAll("#cardFields input, #pseFields input, #pseFields select, #paypalFields input").forEach(el => {
      el.required = false;
    });

    // Activar required solo en campos visibles según el método
    if (esTarjeta) {
      document.querySelectorAll("#cardFields input").forEach(el => el.required = true);
    } else if (esPSE) {
      document.querySelectorAll("#pseFields input, #pseFields select").forEach(el => el.required = true);
    } else if (esPayPal) {
      document.querySelectorAll("#paypalFields input").forEach(el => el.required = true);
    }
  });

  const cargandoPago = document.getElementById("cargandoPago");
  formPago.style.display = "none"; // Ocultar el formulario mientras se carga

  let precioBase = 0;
  let registro = null;

  const multiplicadores = {
    General: 1,
    VIP: 1.5,
    Platino: 2
  };

  if (!eventId || !userId || isNaN(userId)) {
    detailsContainer.innerHTML = `<p>❌ Faltan parámetros en la URL o el usuario no está autenticado.</p>`;
    if (cargandoPago) cargandoPago.innerText = "⚠️ Error: parámetros faltantes.";
    return;
  }

  try {
    const [eventoRes, registroRes] = await Promise.all([
      fetch(`http://localhost:8080/api/public/events/${eventId}`),
      fetch(`http://localhost:8080/api/registrations/user/${userId}`)
    ]);

    if (!eventoRes.ok) throw new Error("No se encontró el evento");
    if (!registroRes.ok) throw new Error("No se pudo obtener inscripción");

    const evento = await eventoRes.json();
    const registros = await registroRes.json();

    const registrosEvento = registros.filter(r => r.eventId === parseInt(eventId));
    registro = registrosEvento[registrosEvento.length - 1];
    if (!registro) throw new Error("No hay inscripción previa para este evento");

    const tipoRaw = registro.ticketType?.toLowerCase() || "general";
    const tipoFinal = tipoRaw === "vip" ? "VIP" : tipoRaw === "platino" ? "Platino" : "General";
    ticketTypeSelect.value = tipoFinal;
    cantidadInput.value = registro.quantity || 1;

    ticketTypeSelect.disabled = true;
    cantidadInput.disabled = true;

    mensajePago.innerHTML = `
      <p style="color: green;">
        ✅ Se encontró una inscripción previa:<br>
        Tipo: <strong>${registro.ticketType}</strong><br>
        Cantidad: <strong>${registro.quantity}</strong>
      </p>
    `;

    document.getElementById("pagoForm").style.display = "block";
    document.getElementById("cargandoPago").style.display = "none";

    precioBase = parseFloat(evento.ticketPrice) || 0;
    titleElement.textContent = evento.name;

    actualizarResumenPago();

    const inicio = new Date(evento.startDate);
    const fin = new Date(evento.endDate);
    const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const opcionesHora = { hour: "2-digit", minute: "2-digit", hour12: true };

    const fechaInicio = `${inicio.toLocaleDateString("es-ES", opcionesFecha)} a las ${inicio.toLocaleTimeString("es-ES", opcionesHora)}`;
    const fechaFin = `${fin.toLocaleDateString("es-ES", opcionesFecha)} a las ${fin.toLocaleTimeString("es-ES", opcionesHora)}`;

    const imagenEvento = evento.imagenes?.find(img => img.url?.includes("/imagenes/"));
    const imagenMapa = evento.imagenes?.find(img => img.url?.includes("/mapas/"));
    const imagenPrincipalUrl = imagenEvento?.url || 'https://source.unsplash.com/800x400/?ticket';

    detailsContainer.innerHTML = `
      <img src="${imagenPrincipalUrl}" alt="Imagen del evento" class="event-img" style="max-width: 100%; margin-bottom: 15px;" />
      <p><strong>📅 Fecha de inicio:</strong> ${fechaInicio}</p>
      <p><strong>🕓 Fecha de finalización:</strong> ${fechaFin}</p>
      <p><strong>📍 Lugar:</strong> ${evento.address}</p>
      <p><strong>📄 Descripción:</strong> ${evento.description}</p>
    `;

    if (imagenMapa?.url) {
      seatingMapImage.src = imagenMapa.url;
      seatingMapContainer.style.display = "block";
    }

    // Mostrar formulario y ocultar cargando
    formPago.style.display = "block";
    if (cargandoPago) cargandoPago.style.display = "none";

    formPago.addEventListener("submit", async (e) => {
      e.preventDefault();
      mensajePago.textContent = "";

      const method = methodInput.value;
      const amount = parseFloat(amountInput.value);

      if (method === "PayPal") {
        const email = document.getElementById("paypalEmail").value;
        const password = document.getElementById("paypalPassword").value;
        if (!email || !password) {
          mensajePago.textContent = "❌ Por favor, complete los campos de PayPal.";
          mensajePago.style.color = "red";
          return;
        }
      }

      if (!method || isNaN(amount)) {
        mensajePago.textContent = "❌ Por favor, complete todos los campos del formulario.";
        mensajePago.style.color = "red";
        return;
      }

      try {
        const resPagoExistente = await fetch(`http://localhost:8080/api/payments/registration/${registro.id}`);
        if (resPagoExistente.ok) {
          const pagoExistente = await resPagoExistente.json();
          mensajePago.textContent = `ℹ️ Ya existe un pago con método ${pagoExistente.method} por $${pagoExistente.amount.toFixed(2)}.`;
          mensajePago.style.color = "blue";
          return;
        }

        const pagoDTO = {
          registrationId: registro.id,
          method,
          amount
        };

        const resPago = await fetch("http://localhost:8080/api/payments/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pagoDTO)
        });

        if (!resPago.ok) {
          const errorMsg = await resPago.text();
          throw new Error(errorMsg);
        }

        await resPago.json();
        mensajePago.textContent = "💰 ¡Pago registrado exitosamente!";
        mensajePago.style.color = "green";
        formPago.reset();
        actualizarResumenPago();

      } catch (err) {
        console.error("❌ Error al procesar:", err.message);
        mensajePago.textContent = "❌ Error al registrar la compra: " + err.message;
        mensajePago.style.color = "red";
      }
    });

    const btnCancelarCompra = document.getElementById("btnCancelarCompra");

    btnCancelarCompra.addEventListener("click", async () => {
      if (!registro?.id) {
        mensajePago.textContent = "⚠️ No se encontró la inscripción a cancelar.";
        mensajePago.style.color = "orange";
        return;
      }

      const confirmar = confirm("¿Estás seguro de que deseas cancelar la compra? Esta acción no se puede deshacer.");
      if (!confirmar) return;

      try {
        const res = await fetch(`http://localhost:8080/api/registrations/${registro.id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error(await res.text());

        // Redirigir a la página de información del evento
        window.location.href = `/infoEvent.html?id=${eventId}`;
      } catch (err) {
        console.error("❌ Error al cancelar compra:", err.message);
        mensajePago.textContent = "❌ Error al cancelar compra: " + err.message;
        mensajePago.style.color = "red";
      }
    });

  } catch (err) {
    console.error("❌ Error al cargar evento o inscripción:", err.message);
    detailsContainer.innerHTML = "<p>⚠️ No se pudo cargar el evento o inscripción previa.</p>";
    if (cargandoPago) cargandoPago.innerText = "⚠️ Error al cargar inscripción o evento.";
  }

  function actualizarResumenPago() {
    const cantidad = parseInt(cantidadInput.value || "1");
    const tipo = ticketTypeSelect.value || "General";
    const multiplicador = multiplicadores[tipo] || 1;
    const precioUnitario = precioBase * multiplicador;
    const total = precioUnitario * cantidad;

    resumenPago.innerHTML = `
      Entradas: <strong>${cantidad}</strong><br>
      Tipo: <strong>${tipo}</strong><br>
      Precio por entrada: <strong>$${precioUnitario.toFixed(2)}</strong><br>
      <strong>Total a pagar: $${total.toFixed(2)}</strong>
    `;

    amountInput.value = total.toFixed(2);
  }
});
