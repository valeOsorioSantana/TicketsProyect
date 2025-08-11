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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("encuestaForm");
    const comentarios = document.getElementById("comentarios");
    const charCounter = document.getElementById("char-counter");
    const successMessage = document.getElementById("success-message");

    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const ratingLabels = document.querySelectorAll('.rating label');

    let selectedRating = 0;

    const ratingMessages = {
        1: { text: "😞 Lo sentimos, ¿qué podemos mejorar?", color: "#ef4444" },
        2: { text: "😐 Hay margen para mejorar", color: "#f97316" },
        3: { text: "😊 Una experiencia decente", color: "#eab308" },
        4: { text: "😃 ¡Nos alegra que te haya gustado!", color: "#22c55e" },
        5: { text: "🤩 ¡Increíble! Eres fantástico", color: "#8b5cf6" }
    };

    // Mostrar mensaje al seleccionar una calificación
    ratingInputs.forEach(input => {
        input.addEventListener("change", () => {
            selectedRating = parseInt(input.value);
            showRatingFeedback();
        });
    });

    function showRatingFeedback() {
        const feedback = document.getElementById("rating-feedback");
        if (!feedback) {
            const div = document.createElement("div");
            div.id = "rating-feedback";
            div.classList.add("text-center", "mt-2");
            form.querySelector(".rating").appendChild(div);
        }

        const message = ratingMessages[selectedRating];
        const feedbackElement = document.getElementById("rating-feedback");
        feedbackElement.textContent = message.text;
        feedbackElement.style.color = message.color;
    }

    // Contador de caracteres
    comentarios.addEventListener("input", () => {
        const length = comentarios.value.length;
        charCounter.textContent = `${length}/500`;

        if (length > 450) {
            charCounter.style.color = '#ef4444';
        } else if (length > 400) {
            charCounter.style.color = '#f97316';
        } else {
            charCounter.style.color = '#6c757d'; // Bootstrap muted
        }
    });

    // Envío del formulario
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const eventId = Number(params.get("eventId"));

        if (!eventId) {
            alert("ID del evento no encontrado en la URL.");
            return;
        }

        const ratingValue = parseInt(document.querySelector('input[name="rating"]:checked')?.value);

        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            shakeStars();
            alert("Por favor selecciona una calificación entre 1 y 5.");
            return;
        }

        const datos = {
            eventId: eventId,
            rating: ratingValue,
            comments: comentarios.value || ""
        };

        fetch('https://ticket-backend-bkkf.onrender.com/api/public/events/satisfaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
            .then(async res => {
                const contentType = res.headers.get("content-type");
                if (!res.ok) {
                    const errorText = contentType && contentType.includes("application/json")
                        ? (await res.json()).message
                        : await res.text();
                    throw new Error(errorText);
                }
                return res.text();
            })
            .then(responseText => {
                console.log("Formulario enviado con éxito:", responseText);
                alert("¡Gracias por tu respuesta! 🎉");  // <-- alerta de confirmación
                successMessage.textContent = "¡Gracias por tu respuesta! 🎉";
                successMessage.classList.add("show");
                form.style.display = "none";

                setTimeout(() => {
                    successMessage.classList.remove("show");
                    form.reset();
                    form.style.display = "block";
                    comentarios.value = "";
                    charCounter.textContent = "0/500";
                    const feedback = document.getElementById("rating-feedback");
                    if (feedback) feedback.textContent = "";
                    selectedRating = 0;
                }, 4000);
            })

            .catch(err => {
                console.error("Error al enviar la encuesta:", err);
                let userFriendlyMessage = "Ocurrió un error inesperado. Por favor, intenta nuevamente.";

                if (err.message.includes("Ya has enviado una encuesta")) {
                    userFriendlyMessage = "Ya has enviado una encuesta para este evento. Solo puedes enviarla una vez.";
                } else if (err.message.includes("Failed to fetch")) {
                    userFriendlyMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.";
                }

                alert(userFriendlyMessage);
            });
    });

    // Animación shake para validación
    function shakeStars() {
        const stars = document.querySelectorAll('.rating label');
        stars.forEach(star => {
            star.style.animation = 'none';
            void star.offsetWidth; // reinicia animación
            star.style.animation = 'shake 0.5s ease-in-out';
        });
    }

    // Estilo para shake
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .rating label {
      font-size: 2rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
  `;
    document.head.appendChild(shakeStyle);
});
