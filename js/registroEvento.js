
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
    window.location.href = 'index.html'
  }
}

function logout() {
  // Eliminar el token del localStorage
  localStorage.removeItem('token'); // Asegúrate de usar la clave que usaste para guardar el token
  localStorage.removeItem('email');
  localStorage.removeItem('nombre');
  // Redirigir al usuario a la página de inicio de sesión o a otra página

  window.location.href = 'index.html'
}

function actualizarEmailDelUsuario() {
  document.getElementById('txt-name-usuario').outerHTML = localStorage.nombre;
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = localStorage.getItem('userId');
  const eventId = urlParams.get("id");
  const form = document.getElementById("registroForm");
  const token = localStorage.getItem("token");

  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");
  const priceInput = document.getElementById("price");
  const quantityInput = document.getElementById("quantity");
  const ticketTypeInput = document.getElementById("ticketType");

  let registrationId = null;
  let precioBase = 0; // Base price from event

  const multiplicadores = {
    General: 1,
    VIP: 1.5,
    Platino: 2
  };

  if (!userId || !eventId || !token) {
    alert("⚠️ Debes iniciar sesión y acceder desde un evento válido.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("eventId").value = eventId;

  // Obtener precio del evento
  try {
    const response = await fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/${eventId}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("No se pudo obtener el evento.");

    const evento = await response.json();

    if (evento.ticketPrice != null) {
      precioBase = parseFloat(evento.ticketPrice);
      priceInput.setAttribute("data-raw", precioBase);
      actualizarPrecioTotal(); // ⚠️ Llamar para precargar el precio si ya hay cantidad
    } else {
      priceInput.value = "No asignado";
      priceInput.setAttribute("data-raw", "0");
    }
  } catch (err) {
    console.error("Error cargando precio:", err);
    alert("⚠️ Error al cargar el precio del evento.");
  }

  // Escuchar cambios
  quantityInput.addEventListener("input", actualizarPrecioTotal);
  ticketTypeInput.addEventListener("change", actualizarPrecioTotal);

  function actualizarPrecioTotal() {
    const cantidad = parseInt(quantityInput.value) || 0;
    const tipo = ticketTypeInput.value;
    const multiplicador = multiplicadores[tipo] || 1;
    const total = precioBase * cantidad * multiplicador;

    priceInput.value = `$${total.toFixed(2)}`;
  }

  // Verificar si ya existe un registro
  try {
    const registrosResponse = await fetch(`https://ticket-backend-bkkf.onrender.com/api/registrations/user/${userId}`);
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
    const ticketType = ticketTypeInput.value;
    const cantidad = parseInt(quantityInput.value);
    const multiplicador = multiplicadores[ticketType] || 1;
    const priceTotal = precioBase * cantidad * multiplicador;

    if (!ticketType || isNaN(cantidad) || cantidad < 1) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    const registrationData = {
      users: { id: parseInt(userId) },
      events: { id: parseInt(eventId) },
      ticketType,
      price: priceTotal,
      quantity: cantidad,
      status: estado,
      reminderDeliveryStatus: "NoRecordado"
    };

    try {
      const res = await fetch("https://ticket-backend-bkkf.onrender.com/api/registrations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      });

      if (res.ok) {
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
      const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/registrations/${regId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("✅ Registro cancelado y eliminado.");
        window.location.href = "infoEvents.html";
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
