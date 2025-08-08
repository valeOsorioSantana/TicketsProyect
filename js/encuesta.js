document.getElementById("encuestaForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const eventId = Number(params.get("eventId"));

    if (!eventId) {
        alert("ID del evento no encontrado en la URL.");
        return;
    }

    const datos = {
        eventId: eventId,
        rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value),
        comments: document.getElementById("comentarios").value || ""
    };

    if (!datos.rating || datos.rating < 1 || datos.rating > 5) {
        alert("Por favor selecciona una calificación entre 1 y 5.");
        return;
    }

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
            alert(responseText);
            this.reset();
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
