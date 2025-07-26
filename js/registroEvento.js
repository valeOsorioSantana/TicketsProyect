document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = localStorage.getItem('userId');
  const eventId = urlParams.get("id");
  const form = document.getElementById("registroForm");

  // Validación previa
  if (!userId || !eventId) {
    alert("Falta información del usuario o evento.");
    return;
  }

  // Rellenar campo oculto si lo usas en el formulario
  const eventIdField = document.getElementById("eventId");
  if (eventIdField) eventIdField.value = eventId;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para registrarte.");
      return;
    }

    const data = {
      users: { id: parseInt(userId) },
      events: { id: parseInt(eventId) },
      ticketType: document.getElementById("ticketType").value,
      price: parseFloat(document.getElementById("price").value),
      status: document.getElementById("status").value,
      reminderDeliveryStatus: "NoRecordado"
    };
    

    try {
      const res = await fetch("http://localhost:8080/api/registrations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("✅ Registro exitoso al evento");
        window.location.href = `detalleEvento.html?id=${eventId}`;
      } else {
        const error = await res.text();
        alert("❌ Error al registrar: " + error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error de conexión con el servidor.");
    }
  });
});
