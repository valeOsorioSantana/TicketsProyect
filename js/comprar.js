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

document.addEventListener("DOMContentLoaded", async () => {
  let tipoSeleccionado = "General";
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const rawUserId = localStorage.getItem("userId");
  const userId = rawUserId ? parseInt(rawUserId) : null;

  const titleElement = document.getElementById("eventTitle");
  const detailsContainer = document.getElementById("eventDetails");
  const seatingMapContainer = document.getElementById("seatingMapContainer");
  const seatingMapImage = document.getElementById("seatingMapImage");

  const formPago = document.getElementById("formPago");
  if (formPago) {
    formPago.style.display = "none";  // o lo que sea
  } else {
    console.warn("formPago no encontrado en el DOM");
  }

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
    const userRes = await fetch(`https://ticket-backend-bkkf.onrender.com/api/users/${userId}`);
    if (!userRes.ok) throw new Error("No se pudo obtener información del usuario");
    const user = await userRes.json();

    const [eventoRes, registroRes] = await Promise.all([
      fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/${eventId}`),
      fetch(`https://ticket-backend-bkkf.onrender.com/api/registrations/user/${userId}`)
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
    tipoSeleccionado = tipoFinal;
    cantidadInput.value = registro.quantity || 1;

    ticketTypeSelect.disabled = true;
    cantidadInput.disabled = true;

    mensajePago.innerHTML = `
  <p style="color: green;">
    ✅ Se encontró una inscripción previa:<br>
    Tipo: <strong>${tipoFinal}</strong><br>
    Cantidad: <strong>${registro.quantity}</strong>
  </p>
`;

    // Verificar si ya existe un pago para esta inscripción previa
    const resPagoExistente = await fetch(`https://ticket-backend-bkkf.onrender.com/api/payments/registration/${registro.id}`);
    if (resPagoExistente.ok) {
      const pagoExistente = await resPagoExistente.json();

      // Ocultar formulario de pago
      formPago.style.display = "none";

      // Mostrar mensaje con pago encontrado
      mensajePago.innerHTML = `
    <p style="color: green;">
      ✅ Se encontró una inscripción previa:<br>
      Tipo: <strong>${tipoFinal}</strong><br>
      Cantidad: <strong>${registro.quantity}</strong><br>
      <strong>Pago confirmado:</strong> Método ${pagoExistente.method} - Monto $${pagoExistente.amount.toFixed(2)}
    </p>
  `;

      // Mostrar el ticket simulado con la info necesaria
      const ticketContainer = document.getElementById("ticketSimulado");
      ticketContainer.style.display = "block";

      document.getElementById("simEventoNombre").textContent = evento.name;
      document.getElementById("simEventoLugar").textContent = evento.address;
      document.getElementById("simEventoFecha").textContent = new Date(evento.startDate).toLocaleString("es-ES");
      document.getElementById("simTipoEntrada").textContent = tipoFinal;
      document.getElementById("simCantidad").textContent = registro.quantity;
      document.getElementById("simPrecioTotal").textContent = pagoExistente.amount.toFixed(2);
      document.getElementById("simUsuarioEmail").textContent = user.email || "Correo no disponible";

      // Generar QR con datos del pago y ticket (si tienes la librería QRCode)
      const qrCanvas = document.getElementById("qrPreview");
      QRCode.toCanvas(qrCanvas, `Evento: ${evento.name}\nUsuario: ${user.email}\nTipo: ${tipoFinal}\nCantidad: ${registro.quantity}\nTotal: $${pagoExistente.amount.toFixed(2)}`, { width: 150 }, function (error) {
        if (error) console.error(error);
      });

    } else {
      // Si no hay pago, mostrar formulario de pago
      formPago.style.display = "block";
      if (cargandoPago) cargandoPago.style.display = "none";
    }

    actualizarResumenPago(tipoFinal, registro.quantity);

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

    function mostrarTicketSimulado(ticket, evento, emailUsuario, cantidad, tipoEntrada, precioTotal, qrText) {
      const ticketContainer = document.getElementById("ticketSimulado");
      if (!ticketContainer) return;

      ticketContainer.style.display = "block";

      document.getElementById("simEventoNombre").textContent = evento.name;
      document.getElementById("simEventoLugar").textContent = evento.address;
      document.getElementById("simEventoFecha").textContent = new Date(evento.startDate).toLocaleString("es-ES");
      document.getElementById("simTipoEntrada").textContent = tipoEntrada;
      document.getElementById("simCantidad").textContent = cantidad;
      document.getElementById("simPrecioTotal").textContent = precioTotal;
      document.getElementById("simUsuarioEmail").textContent = emailUsuario || "Correo no disponible";

      const qrCanvas = document.getElementById("qrPreview");
      QRCode.toCanvas(qrCanvas, qrText, { width: 150 }, function (error) {
        if (error) console.error(error);
      });
    }

    formPago.addEventListener("submit", async (e) => {
      e.preventDefault();
      mensajePago.textContent = "";

      const method = methodInput.value;
      const amount = parseFloat(amountInput.value);

      if (!method || isNaN(amount)) {
        mensajePago.textContent = "❌ Por favor, complete todos los campos del formulario.";
        mensajePago.style.color = "red";
        return;
      }

      if (method === "PayPal") {
        const emailInput = document.getElementById("paypalEmail");
        const passwordInput = document.getElementById("paypalPassword");

        if (!emailInput || !passwordInput) {
          mensajePago.textContent = "❌ Campos de PayPal no encontrados. Verifica el formulario.";
          mensajePago.style.color = "red";
          return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
          mensajePago.textContent = "❌ Por favor, complete los campos de PayPal.";
          mensajePago.style.color = "red";
          return;
        }
      }

      if (method === "PSE") {
        const bank = document.getElementById("pseBank").value;
        const pseName = document.getElementById("pseName").value;
        if (!bank || !pseName) {
          mensajePago.textContent = "❌ Por favor, complete los campos de PSE.";
          mensajePago.style.color = "red";
          return;
        }
      }

      if (method === "Tarjeta de crédito" || method === "Tarjeta de débito") {
        const cardNumber = document.getElementById("cardNumber").value;
        const cardName = document.getElementById("cardName").value;
        const cardExpiry = document.getElementById("cardExpiry").value;
        const cardCVC = document.getElementById("cardCVC").value;

        if (!cardNumber || !cardName || !cardExpiry || !cardCVC) {
          mensajePago.textContent = "❌ Por favor, complete todos los campos de tarjeta.";
          mensajePago.style.color = "red";
          return;
        }
      }

      try {

        const resPagoExistente = await fetch(`https://ticket-backend-bkkf.onrender.com/api/payments/registration/${registro.id}`);
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

        const resPago = await fetch("https://ticket-backend-bkkf.onrender.com/api/payments/", {
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
        formPago.style.display = "none";

        document.getElementById("ticketSimulado").style.display = "block";

        document.getElementById("simUsuarioEmail").textContent = rawUserId || "usuario@ejemplo.com"; // o user.email si tienes objeto user
        document.getElementById("simEventoNombre").textContent = evento.name;
        document.getElementById("simEventoLugar").textContent = evento.address;
        document.getElementById("simEventoFecha").textContent = new Date(evento.startDate).toLocaleString("es-ES");
        document.getElementById("simTipoEntrada").textContent = tipoSeleccionado;
        document.getElementById("simCantidad").textContent = cantidadInput.value;
        document.getElementById("simPrecioTotal").textContent = amountInput.value;

        // Generar texto QR para usar después en el envío de correo
        const qrText = `Evento:${evento.name}\nUsuario:${rawUserId}\nTipo:${tipoSeleccionado}\nCantidad:${cantidadInput.value}\nTotal:$${amountInput.value}`;

        // Generar QR en canvas
        const qrPreviewCanvas = document.getElementById("qrPreview");
        QRCode.toCanvas(qrPreviewCanvas, qrText, { width: 150 }, function (error) {
          if (error) console.error(error);
        });

        // Guardar qrText global para usar en el botón de enviar correo
        window.qrText = qrText;

        actualizarResumenPago();

        const resTicket = await fetch(`https://ticket-backend-bkkf.onrender.com/api/tickets/${registro.id}`, {
          method: "POST"
        });

        if (!resTicket.ok) {
          throw new Error("No se pudo generar el ticket.");
        }

        const ticket = await resTicket.json();

        mostrarTicketSimulado(ticket, evento, localStorage.getItem("userEmail") || "usuario@ejemplo.com", registro.quantity, tipoSeleccionado, amount, qrText);

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
        const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/registrations/${registro.id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error(await res.text());

        // Redirigir a la página de información del evento
        window.location.href = `./infoEvent.html?id=${eventId}`;
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
    let tipo = tipoSeleccionado;

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

document.getElementById("verMisTicketsBtn").addEventListener("click", () => {
  window.location.href = "tickets.html";
});

const btnVerEventos = document.querySelector('.btn-ver-eventos');

btnVerEventos.addEventListener('click', () => {
  window.location.href = './index.html';
});