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
    tokenData = jwt_decode(token);
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

  async function cargarNotificaciones() {
    try {
      const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Error al cargar notificaciones");

      const notificaciones = await res.json();
      contenedor.innerHTML = "";

      const notificacionesFiltradas = notificaciones.filter(noti => {
        if (rol === "USER") return noti.receiverType === "USER";
        if (rol === "ADMIN") return noti.receiverType === "ADMIN";
        return false;
      });

      if (notificacionesFiltradas.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-info">No hay notificaciones disponibles.</div>`;
        return;
      }

      notificacionesFiltradas.forEach(noti => {
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
      programarRecordatorios(notificacionesFiltradas);

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
          await fetch(`https://ticket-backend-bkkf.onrender.com/api/notifications/${id}/mark-as-read`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
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
          await fetch(`https://ticket-backend-bkkf.onrender.com/api/notifications/${id}`, {
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
      btn.addEventListener("click", async () => {
        const noti = btn.closest(".notificacion");
        const id = noti?.dataset?.id;
        if (!id) return;

        try {
          const res = await fetch(`https://ticket-backend-bkkf.onrender.com/api/notifications/${id}/mark-as-read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            noti.classList.add("leida");
          } else {
            console.error("No se pudo marcar la notificación como leída");
          }
        } catch (err) {
          console.error("Error al marcar como leída:", err);
        }
      });
    });
  }

  function programarRecordatorios(notificaciones) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    notificaciones.forEach(noti => {
      const esRecordatorio = noti?.type === "REMINDER" || noti?.isReminder;
      const eventoTime = new Date(noti?.scheduledAt || noti?.createdAt);

      if (!esRecordatorio || !eventoTime) return;

      const ahora = new Date();
      const msRestantes = eventoTime - ahora;

      if (msRestantes > 0 && msRestantes < 86400000) {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("📌 Recordatorio de Evento", {
              body: noti.messageContent || "Tienes un evento programado.",
            });
          } else {
            alert("Recordatorio: " + (noti.messageContent || "Tienes un evento."));
          }
        }, msRestantes);
      }
    });
  }

  document.querySelector(".btn-marcar-todo")?.addEventListener("click", async () => {
    try {
      await fetch(`https://ticket-backend-bkkf.onrender.com/api/notifications/${userId}/mark-all-as-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      document.querySelectorAll(".notificacion").forEach(noti => noti.classList.add("leida"));
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  });

  // Llamada principal
  cargarNotificaciones();
});
