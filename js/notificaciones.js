document.addEventListener("DOMContentLoaded", () => {
  // Botón "Leer todo"
  const btnMarcarTodo = document.querySelector(".btn-marcar-todo");
  if (btnMarcarTodo) {
    btnMarcarTodo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Evita que se cierre el dropdown
      document.querySelectorAll(".notificacion").forEach(noti => {
        noti.classList.add("leida");
      });
    });
  }

  // Botones individuales "Leído"
  document.querySelectorAll(".noti-btn.leido").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const noti = btn.closest(".notificacion");
      noti.classList.add("leida");
    });
  });

  // Botones individuales "Eliminar"
  document.querySelectorAll(".noti-btn.eliminar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const noti = btn.closest(".notificacion");
      noti.remove();
    });
  });

  // Botones individuales "Responder"
  document.querySelectorAll(".noti-btn.responder").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const noti = btn.closest(".notificacion");

      // Evita crear múltiples formularios
      if (noti.querySelector(".respuesta-form")) return;

      const form = document.createElement("div");
      form.className = "respuesta-form mt-1";
      form.innerHTML = `
        <input type="text" class="form-control form-control-sm mb-1" placeholder="Responder...">
        <button class="btn btn-sm btn-primary btn-block btn-enviar-respuesta">Enviar</button>
      `;
      noti.appendChild(form);

      const btnEnviar = form.querySelector(".btn-enviar-respuesta");
      const input = form.querySelector("input");

      btnEnviar.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const mensaje = input.value.trim();
        if (!mensaje) {
          alert("Por favor escribe una respuesta.");
          return;
        }

        const p = document.createElement("p");
        p.textContent = "Tú: " + mensaje;
        p.style.fontStyle = "italic";
        p.classList.add("mt-1", "text-sm", "text-muted");
        noti.appendChild(p);

        form.remove();
      });
    });
  });
});
