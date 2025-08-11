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

document.addEventListener("DOMContentLoaded", async () => {
  const userId = parseInt(localStorage.getItem("userId"));
  const container = document.getElementById("ticketsContainer");

  if (!userId) {
    container.innerHTML = "<p>⚠️ Usuario no autenticado.</p>";
    return;
  }

  try {
    const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/tickets/users/${userId}`);
    if (!res.ok) throw new Error("No se pudieron cargar los tickets.");

    const tickets = await res.json();
    if (tickets.length === 0) {
      container.innerHTML = "<p>No tienes tickets comprados aún.</p>";
      return;
    }

    for (const ticket of tickets) {
      if (ticket.cancelada) continue;

      const evento = ticket.event;
      const registro = ticket.registration;
      const fechaEvento = new Date(evento.startDate).toLocaleString("es-ES");

      const ticketHTML = `
  <div class="ticketCard">
    <div class="ticketCard-header">
      <h3>${evento.name}</h3>
      <span>${fechaEvento}</span>
    </div>
    <div class="ticketCard-body">
      <p><strong>📍 Lugar:</strong> ${evento.address}</p>
      <p><strong>Tipo:</strong> ${registro.ticketType}</p>
      <p><strong>Cantidad:</strong> ${registro.quantity}</p>
      <p><strong>Precio total:</strong> $${registro.price}</p>
    </div>
    <div class="ticketCard-footer">
  <canvas id="qr-${ticket.id}" class="qr-container"></canvas>
  <button class="cancel-btn" data-ticket-id="${ticket.id}">
    <i class="fas fa-times"></i> Cancelar Ticket
  </button>
</div>
  </div>
`;

      const div = document.createElement("div");
      div.innerHTML = ticketHTML;
      const ticketCard = div.firstElementChild;
      container.appendChild(div);

      const qrCanvas = ticketCard.querySelector(`#qr-${ticket.id}`);
      const qrText = `
        Ticket ID: ${ticket.id}
        Evento: ${evento.name}
        Usuario: ${registro.users?.email || "Desconocido"}
        Tipo: ${registro.ticketType}
        Cantidad: ${registro.quantity}
        Precio: $${registro.price}
      `;

      QRCode.toCanvas(qrCanvas, qrText, { width: 150 }, err => {
        if (err) console.error("Error al generar QR", err);
      });

      const cancelButton = ticketCard.querySelector(".cancel-btn");
      cancelButton.addEventListener("click", async () => {
        const ticketId = cancelButton.getAttribute("data-ticket-id");

        const confirmCancel = confirm("¿Estás seguro de que quieres cancelar este ticket?");
        if (!confirmCancel) return;

        try {
          const cancelRes = await fetch(`https://ticket-backend-bkkf.onrender.com/cancelacion/${ticketId}/cancelar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ ticketsId: ticketId })
          });

          const cancelData = await cancelRes.json();

          if (!cancelRes.ok) {
            throw new Error(cancelData.mensaje || "No se pudo cancelar el ticket.");
          }

          alert(`✅ ${cancelData.mensaje}\nMonto reembolsado es de: $${cancelData.montoReembolsado}\n📩 Recibirás tu reembolso en el transcurso de 3 días.`);

          // ✅ Removemos solo la tarjeta del ticket
          ticketCard.remove();

        } catch (error) {
          console.error("Error al cancelar ticket:", error);

          if (error.message.includes("tan cerca del evento")) {
            alert("❌ No puedes cancelar este ticket porque el evento está muy próximo.");
          } else {
            alert("❌ No se pudo cancelar el ticket. Intenta más tarde.");
          }
        }
      });
    }

  } catch (error) {
    console.error("Error al obtener tickets:", error);
    container.innerHTML = "<p>❌ No se pudieron cargar los tickets.</p>";
  }
});
