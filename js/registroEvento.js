document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = localStorage.getItem('userId');
  const eventId = urlParams.get("id");
  const form = document.getElementById("registroForm");
  const token = localStorage.getItem("token");

  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");
  const priceInput = document.getElementById("price");
  let registrationId = null;

  if (!userId || !eventId || !token) {
    alert("⚠️ Debes iniciar sesión y acceder desde un evento válido.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("eventId").value = eventId;

  // Cargar precio del evento
  try {
    const response = await fetch(`http://localhost:8080/api/public/events/${eventId}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("No se pudo obtener el evento.");

    const evento = await response.json();

    if (evento.ticketPrice != null) {
      priceInput.value = `$${parseFloat(evento.ticketPrice).toFixed(2)}`;
      priceInput.setAttribute("data-raw", parseFloat(evento.ticketPrice));
    } else {
      priceInput.value = "No asignado";
      priceInput.setAttribute("data-raw", "0");
    }
  } catch (err) {
    console.error("Error cargando precio:", err);
    alert("⚠️ Error al cargar el precio del evento.");
  }

  // Buscar si ya existe un registro para este usuario y evento
  try {
    const registrosResponse = await fetch(`http://localhost:8080/api/registrations/user/${userId}`);
    const registros = await registrosResponse.json();

    const existente = registros.find(r => r.events.id == eventId);
    if (existente) {
      registrationId = existente.id;
      console.log("Registro existente detectado:", registrationId);
    }
  } catch (err) {
    console.warn("No se pudo verificar registro previo.");
  }

  // Confirmar
  btnConfirmar?.addEventListener("click", () => enviarRegistro("Confirmado"));

  // Cancelar
  btnCancelar?.addEventListener("click", () => {
    if (!registrationId) {
      alert("⚠️ No hay registro para eliminar.");
      return;
    }
    eliminarRegistro(registrationId);
  });

  async function enviarRegistro(estado) {
    const ticketType = document.getElementById("ticketType").value;
    const price = parseFloat(priceInput.getAttribute("data-raw"));

    if (!ticketType) {
      alert("Por favor selecciona un tipo de entrada.");
      return;
    }

    const registrationData = {
      users: { id: parseInt(userId) },
      events: { id: parseInt(eventId) },
      ticketType,
      price,
      status: estado,
      reminderDeliveryStatus: "NoRecordado"
    };

    try {
      const res = await fetch("http://localhost:8080/api/registrations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      });

      if (res.ok) {
        const result = await res.text();
        alert(`✅ Registro ${estado.toLowerCase()} exitosamente.`);
        window.location.href = `comprar.html?id=${eventId}`;
      } else {
        const error = await res.text();
        alert("❌ Error al registrar: " + error);
      }
    } catch (error) {
      console.error("❌ Error en la conexión:", error);
      alert("No se pudo completar el registro.");
    }
  }

  async function eliminarRegistro(regId) {
    try {
      const res = await fetch(`http://localhost:8080/api/registrations/${regId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("✅ Registro cancelado y eliminado.");
        window.location.href = "userEvents.html";
      } else {
        const error = await res.text();
        alert("❌ Error al cancelar: " + error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error en la conexión.");
    }
  }
});
