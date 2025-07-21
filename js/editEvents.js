document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  if (!eventId) {
    document.getElementById("errorMensaje").textContent = "ID del evento no encontrado en la URL.";
    return;
  }

  const apiUrl = `http://localhost:8080/api/public/events/${eventId}`;
  const latInput = document.getElementById("latitudEvento");
  const lonInput = document.getElementById("longitudEvento");
  let marker, map;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener evento");
      return response.json();
    })
    .then(event => {
      document.getElementById("idEvento").value = event.id;
      document.getElementById("nombreEvento").value = event.name;
      document.getElementById("descripcionEvento").value = event.description;
      document.getElementById("categoriaEvento").value = event.category;
      document.getElementById("direccionEvento").value = event.address;
      document.getElementById("fechaInicioEvento").value = event.startDate.split("T")[0];
      document.getElementById("fechaFinEvento").value = event.endDate.split("T")[0];
      document.getElementById("estadoEvento").value = event.status;
      latInput.value = event.latitude;
      lonInput.value = event.longitude;
      document.getElementById("imagenEvento").src = event.imagen?.url || "";

      const pos = [event.latitude, event.longitude];
      map = L.map("map").setView(pos, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      marker = L.marker(pos).addTo(map).bindPopup(event.name).openPopup();

      map.on("click", function (e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        latInput.value = lat;
        lonInput.value = lng;

        if (marker) marker.setLatLng(e.latlng);
        else marker = L.marker(e.latlng).addTo(map);
      });
    })
    .catch(error => {
      document.getElementById("errorMensaje").textContent = error.message;
    });

  document.getElementById("btnGuardarCambios").addEventListener("click", async () => {
    const datosEvento = {
      name: document.getElementById("nombreEvento").value,
      description: document.getElementById("descripcionEvento").value,
      startDate: document.getElementById("fechaInicioEvento").value + "T00:00:00",
      endDate: document.getElementById("fechaFinEvento").value + "T00:00:00",
      category: document.getElementById("categoriaEvento").value,
      address: document.getElementById("direccionEvento").value,
      latitude: parseFloat(latInput.value),
      longitude: parseFloat(lonInput.value),
      status: document.getElementById("estadoEvento").value
    };

    const fileInput = document.getElementById("imagenFile");
    const formData = new FormData();
    const file = fileInput?.files?.[0];
    if (file) {
      formData.append("file", file); // Solo si se seleccionó una imagen
    }
    formData.append("event", JSON.stringify(datosEvento));
    formData.append("file", file);

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error("Error al actualizar evento: " + text);
      }

      alert("¡Evento actualizado con éxito!");

      window.location.href = "events.html";
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    }
  });
});
