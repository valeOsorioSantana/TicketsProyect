document.addEventListener("DOMContentLoaded", async () => {
  const userId = parseInt(localStorage.getItem("userId"));
  const container = document.getElementById("ticketsContainer");

  if (!userId) {
    container.innerHTML = "<p>⚠️ Usuario no autenticado.</p>";
    return;
  }

  try {
    const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/tickets/user/${userId}`);
    if (!res.ok) throw new Error("No se pudieron cargar los tickets.");

    const tickets = await res.json();
    if (tickets.length === 0) {
      container.innerHTML = "<p>No tienes tickets comprados aún.</p>";
      return;
    }

    for (const ticket of tickets) {
      const evento = ticket.event;
      const registro = ticket.registration;
      const fechaEvento = new Date(evento.startDate).toLocaleString("es-ES");

      const ticketHTML = `
        <div class="ticketCard">
          <h2>${evento.name}</h2>
          <p><strong>📅 Fecha:</strong> ${fechaEvento}</p>
          <p><strong>📍 Lugar:</strong> ${evento.address}</p>
          <p><strong>Tipo:</strong> ${registro.ticketType}</p>
          <p><strong>Cantidad:</strong> ${registro.quantity}</p>
          <p><strong>Precio total:</strong> $${registro.price}</p>
          <p><strong>Estado:</strong> ${ticket.cancelada ? "❌ Cancelado" : "✅ Activo"}</p>
          <canvas id="qr-${ticket.id}"></canvas>
        </div>
        <hr/>
      `;

      const div = document.createElement("div");
      div.innerHTML = ticketHTML;
      container.appendChild(div);

      // Generar QR real del backend o reconstruido
      const qrCanvas = document.getElementById(`qr-${ticket.id}`);
      const qrText = `Ticket ID: ${ticket.id}\nEvento: ${evento.name}\nUsuario: ${registro.users?.email || "Desconocido"}\nTipo: ${registro.ticketType}\nCantidad: ${registro.quantity}\nPrecio: $${registro.price}`;
      QRCode.toCanvas(qrCanvas, qrText, { width: 150 }, err => {
        if (err) console.error("Error al generar QR", err);
      });
    }

  } catch (error) {
    console.error("Error al obtener tickets:", error);
    container.innerHTML = "<p>❌ No se pudieron cargar los tickets.</p>";
  }
});
