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

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    // Cache simple
    let cacheEventos = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en ms

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,

        select: function (info) {
            document.getElementById('eventStart').value = info.startStr + 'T00:00';
            document.getElementById('eventEnd').value = info.endStr ? info.endStr + 'T00:00' : '';
            document.getElementById('eventName').value = '';
            document.getElementById('eventCategory').value = '';
            document.getElementById('eventImageUrl').value = '';
            document.getElementById('eventAddress').value = '';

            new bootstrap.Modal(document.getElementById('eventModal')).show();
        },

        events: function (info, successCallback, failureCallback) {
            const now = Date.now();

            // Si hay cache reciente, usarla y salir
            if (cacheEventos && (now - cacheTimestamp) < CACHE_DURATION) {
                successCallback(cacheEventos);
                return;
            }

            const loadingMessage = document.getElementById('loadingMessage');
            loadingMessage.style.display = 'block';  // Mostrar mensaje antes de cargar

            // Petición con filtro por rango de fechas visible
            fetch(`https://ticket-backend-bkkf.onrender.com/api/public/events/?start=${info.startStr}&end=${info.endStr}`, {
                method: 'GET',
                headers: { "Accept": "application/json" }
            })
                .then(response => response.json())
                .then(data => {
                    const eventosPublicados = data
                        .filter(ev => ev.status === "PUBLICADO")
                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

                    const events = eventosPublicados.map(evento => ({
                        id: evento.id,
                        title: evento.name,
                        start: evento.startDate,
                        end: evento.endDate,
                        extendedProps: {
                            category: evento.category,
                            imageUrl: evento.imagenes?.[0]?.url || '',
                            address: evento.address,
                            description: evento.description
                        }
                    }));

                    // Guardar cache
                    cacheEventos = events;
                    cacheTimestamp = now;

                    successCallback(events);
                    loadingMessage.style.display = 'none';
                })
                .catch(error => {
                    console.error("Error cargando eventos en el calendario:", error);
                    failureCallback(error);
                    loadingMessage.style.display = 'none'; 
                });
        },

        eventDidMount: function (info) {
            const imgUrl = info.event.extendedProps.imageUrl;
            if (imgUrl) {
                const imgEl = document.createElement('img');
                imgEl.src = imgUrl;
                imgEl.style.width = '50px';
                imgEl.style.height = '50px';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '4px';
                imgEl.style.marginRight = '8px';
                imgEl.style.verticalAlign = 'middle';

                const titleEl = info.el.querySelector('.fc-event-title');
                if (titleEl) {
                    titleEl.prepend(imgEl);
                }
            }
        },

        eventClick: function (info) {
            const eventId = info.event.id;
            window.location.href = `infoEvent.html?id=${eventId}`;
        }

    });

    calendar.render();

    /* document.getElementById('saveEvent').addEventListener('click', function () {
        const name = document.getElementById('eventName').value;
        const startDate = document.getElementById('eventStart').value;
        const endDate = document.getElementById('eventEnd').value;
        const category = document.getElementById('eventCategory').value;
        const imageUrl = document.getElementById('eventImageUrl').value;
        const address = document.getElementById('eventAddress').value;

        fetch('/api/public/events/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                startDate,
                endDate: endDate || null,
                category,
                imageUrl,
                address
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al guardar evento');
                return response.json();
            })
            .then(data => {
                calendar.refetchEvents();
                bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
                // Limpiar cache para forzar nueva carga
                cacheEventos = null;
                cacheTimestamp = 0;
            })
            .catch(err => console.error('Error al guardar evento:', err));
    }); */
});
