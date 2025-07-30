document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("notificaciones-list");
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    contenedor.innerHTML = `<div class="alert alert-danger">No autorizado (token no encontrado).</div>`;
    return;
  }

  let tokenData;
  try {
    tokenData = jwt_decode(token); // Asegúrate de que el script jwt-decode esté incluido en tu HTML
  } catch (err) {
    console.error("❌ Token inválido:", err);
    contenedor.innerHTML = `<div class="alert alert-danger">Token inválido o dañado.</div>`;
    return;
  }

  const userId = tokenData?.id;
  if (!userId) {
    contenedor.innerHTML = `<div class="alert alert-danger">No se pudo obtener el ID del usuario desde el token.</div>`;
    return;
  }

  // Obtener notificaciones desde el backend
  async function cargarNotificaciones() {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Error al cargar notificaciones");

      const notificaciones = await res.json();
      contenedor.innerHTML = "";

      notificaciones.forEach(noti => {
        const elemento = document.createElement("div");
        elemento.className = `list-group-item notificacion ${noti.read ? 'leida' : ''}`;
        elemento.dataset.id = noti.id;

        elemento.innerHTML = `
          <div class="d-flex justify-content-between">
            <div>
              <strong>${noti.user?.nombre || 'Usuario'}</strong> ${noti.messageContent}
              <div class="text-muted small">${new Date(noti.createdAt).toLocaleString()}</div>
            </div>
            <div class="acciones-noti">
              <button class="btn btn-sm btn-outline-success noti-btn leido">✓</button>
              <button class="btn btn-sm btn-outline-primary noti-btn responder">💬</button>
              <button class="btn btn-sm btn-outline-danger noti-btn eliminar">🗑️</button>
            </div>
          </div>
        `;
        contenedor.appendChild(elemento);
      });

      activarAcciones();

    } catch (err) {
      console.error("Error:", err);
      contenedor.innerHTML = `<div class="alert alert-danger">No se pudieron cargar las notificaciones.</div>`;
    }
  }

  function activarAcciones() {
    document.querySelectorAll(".noti-btn.leido").forEach(btn => {
      btn.addEventListener("click", async () => {
        const noti = btn.closest(".notificacion");
        const id = noti?.dataset?.id;
        if (!id) return;

        try {
          await fetch(`http://localhost:8080/api/notifications/${id}/mark-as-read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });
          noti.classList.add("leida");
        } catch (err) {
          console.error("Error al marcar como leída:", err);
        }
      });
    });

    document.querySelectorAll(".noti-btn.eliminar").forEach(btn => {
      btn.addEventListener("click", async () => {
        const noti = btn.closest(".notificacion");
        const id = noti?.dataset?.id;
        if (!id) return;

        try {
          await fetch(`http://localhost:8080/api/notifications/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          noti.remove();
        } catch (err) {
          console.error("Error al eliminar:", err);
        }
      });
    });

    document.querySelectorAll(".noti-btn.responder").forEach(btn => {
      btn.addEventListener("click", () => {
        const noti = btn.closest(".notificacion");
        const id = noti?.dataset?.id;
        if (!id || noti.querySelector(".respuesta-form")) return;

        const form = document.createElement("div");
        form.className = "respuesta-form mt-2";
        form.innerHTML = `
          <input type="text" class="form-control form-control-sm mb-1" placeholder="Responder...">
          <button class="btn btn-sm btn-primary btn-block">Enviar</button>
        `;
        noti.appendChild(form);

        const input = form.querySelector("input");
        const btnEnviar = form.querySelector("button");

        btnEnviar.addEventListener("click", async () => {
          const mensaje = input.value.trim();
          if (!mensaje) return alert("Escribe algo.");

          try {
            await fetch(`http://localhost:8080/api/notifications/responder`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notificacionId: id, mensaje })
            });

            const p = document.createElement("p");
            p.className = "text-muted small mt-2 font-italic";
            p.textContent = `Tú: ${mensaje}`;
            noti.appendChild(p);
            form.remove();
          } catch (err) {
            console.error("Error al responder:", err);
          }
        });
      });
    });
  }

  document.querySelector(".btn-marcar-todo")?.addEventListener("click", async () => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${userId}/mark-all-as-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      document.querySelectorAll(".notificacion").forEach(noti => noti.classList.add("leida"));
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  });

  cargarNotificaciones();
});
