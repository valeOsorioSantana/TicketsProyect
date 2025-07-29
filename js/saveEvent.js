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

document.addEventListener("DOMContentLoaded", function () {
  const inputLocation = document.getElementById("eventLocation");
  const errorLocation = document.getElementById("errorEventLocation");
  const btnGetLocation = document.getElementById("btnGetEventLocation");
  const btnCrear = document.getElementById("btnCrearEvento");
  const btnVolver = document.getElementById("btnVolver");
  const btnConfirm = document.getElementById("btnConfirm");
  const vistaPrevia = document.getElementById("vistaPrevia");

  let marker;
  let datosEvento = {};

  const form = document.getElementById("formEvento");
  const selectCategoria = document.getElementById("category");
  const campoOtraCategoria = document.getElementById("otraCategoriaCampo");
  const inputOtraCategoria = document.getElementById("otraCategoria");

  selectCategoria.addEventListener("change", function () {
    if (this.value === "Otros") {
      campoOtraCategoria.style.display = "block";
    } else {
      campoOtraCategoria.style.display = "none";
      inputOtraCategoria.value = "";
    }
  });

  const map = L.map('map').setView([-12.0464, -77.0428], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  map.on('click', function (e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    inputLocation.value = `${lat}, ${lng}`;
    errorLocation.textContent = "";

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }
  });

  btnGetLocation?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      errorLocation.textContent = "Tu navegador no soporta geolocalización.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        inputLocation.value = `${lat}, ${lng}`;
        errorLocation.textContent = "";

        const latlng = L.latLng(lat, lng);
        if (marker) marker.setLatLng(latlng);
        else marker = L.marker(latlng).addTo(map);
        map.setView(latlng, 15);
      },
      (errorObj) => {
        const messages = {
          1: "Permiso denegado.",
          2: "Ubicación no disponible.",
          3: "Tiempo de espera excedido."
        };
        errorLocation.textContent = messages[errorObj.code] || "Error desconocido.";
        inputLocation.value = "";
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  btnCrear?.addEventListener("click", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;
    const locationStr = inputLocation.value.trim();
    const address = document.getElementById("address").value.trim();
    let category = selectCategoria.value;
    const ticketPriceStr = document.getElementById("ticketPrice")?.value.trim(); // Nuevo campo
    const status = document.getElementById("status").value;
    const imageInput = document.getElementById("imageFile");

    if (category === "Otros") {
      category = inputOtraCategoria.value.trim();
      if (!category) {
        alert("Por favor ingresa la nueva categoría.");
        return;
      }
    }

    // Validaciones básicas
    if (!name || !description || !startDate || !endDate || !locationStr || !category || !status || !address || !imageInput.files[0]) {
      alert("Por favor completa todos los campos y selecciona una imagen.");
      return;
    }

    const [latitude, longitude] = locationStr.split(",").map(coord => parseFloat(coord.trim()));
    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Ubicación inválida. Usa el botón 📍 o haz clic en el mapa.");
      return;
    }

    // ✅ Validación del precio
    const ticketPrice = parseFloat(ticketPriceStr);
    if (isNaN(ticketPrice) || ticketPrice < 0) {
      alert("Por favor ingresa un precio válido para la entrada.");
      return;
    }

    if (!startDate.includes("T")) startDate += "T00:00:00";
    if (!endDate.includes("T")) endDate += "T00:00:00";

    datosEvento = {
      name,
      description,
      startDate,
      endDate,
      latitude,
      longitude,
      category,
      status,
      address,
      ticketPrice  // ✅ Incluido
    };

    // Mostrar vista previa
    document.getElementById("previewName").innerText = name;
    document.getElementById("previewDescription").innerText = description;
    document.getElementById("previewStartDate").innerText = startDate;
    document.getElementById("previewEndDate").innerText = endDate;
    document.getElementById("previewLocation").innerText = locationStr;
    document.getElementById("previewCategory").innerText = category;
    document.getElementById("previewStatus").innerText = status;
    document.getElementById("previewAddress").innerText = address;
    document.getElementById("previewTicketPrice").innerText = `$${ticketPrice.toFixed(2)}`; // ✅ Mostrar

    const previewImage = document.getElementById("previewImageFile");
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
    };
    reader.readAsDataURL(imageInput.files[0]);

    form.style.display = "none";
    vistaPrevia.style.display = "block";
  });

  btnVolver?.addEventListener("click", function () {
    vistaPrevia.style.display = "none";
    form.style.display = "block";
  });

  btnConfirm?.addEventListener("click", async function () {
    const imageInput = document.getElementById("imageFile");
    const file = imageInput.files[0];

    const formData = new FormData();
    formData.append("event", JSON.stringify(datosEvento));
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/public/events/", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Error al guardar el evento: " + errorText);
      }

      alert("¡Evento creado exitosamente!");
      form.reset();
      form.style.display = "block";
      vistaPrevia.style.display = "none";
      inputLocation.value = "";
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }

    } catch (error) {
      alert("Hubo un error: " + error.message);
      console.error(error);
    }
  });
});
