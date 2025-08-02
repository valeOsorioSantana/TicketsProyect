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
  const categoriaSelect = document.getElementById("categoriaEvento");
  const otraCategoriaCampo = document.getElementById("otraCategoriaCampo");
  const otraCategoriaInput = document.getElementById("otraCategoria");
  const precioInput = document.getElementById("precioEvento");
  const imagenActual = document.getElementById("imagenEvento");
  const imagenMapaActual = document.getElementById("imagenMapaActual");
  const imagenNuevaInput = document.getElementById("imagenFile");
  const imagenMapaInput = document.getElementById("imagenMapaFile");

  let marker, map;

  // Mostrar u ocultar campo "Otra categoría"
  categoriaSelect.addEventListener("change", () => {
    const esOtra = categoriaSelect.value === "Otros";
    otraCategoriaCampo.style.display = esOtra ? "block" : "none";
    if (!esOtra) otraCategoriaInput.value = "";
  });

  // Obtener evento por ID
  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener evento");
      return res.json();
    })
    .then(event => {
      // Rellenar campos
      document.getElementById("idEvento").value = event.id;
      document.getElementById("nombreEvento").value = event.name;
      document.getElementById("descripcionEvento").value = event.description;
      document.getElementById("direccionEvento").value = event.address;
      document.getElementById("fechaInicioEvento").value = event.startDate.split("T")[0];
      document.getElementById("fechaFinEvento").value = event.endDate.split("T")[0];
      document.getElementById("estadoEvento").value = event.status;
      latInput.value = event.latitude;
      lonInput.value = event.longitude;
      precioInput.value = event.ticketPrice ?? "";

      // Mostrar imágenes del evento (principal y mapa)
      if (Array.isArray(event.imagenes)) {
        const imagenEvento = event.imagenes.find(img => img.url.includes("/imagenes/"));
        const imagenMapa = event.imagenes.find(img => img.url.includes("/mapas/"));

        if (imagenEvento && imagenEvento.url && !imagenEvento.url.includes("Error")) {
          imagenActual.src = imagenEvento.url;
          imagenActual.alt = "Imagen del evento";
          imagenActual.style.display = "block";
        } else {
          imagenActual.style.display = "none";
        }

        if (imagenMapa && imagenMapa.url && !imagenMapa.url.includes("Error")) {
          imagenMapaActual.src = imagenMapa.url;
          imagenMapaActual.alt = "Mapa del evento";
          imagenMapaActual.style.display = "block";

          imagenMapaActual.onerror = () => {
            console.warn("❌ No se pudo cargar la imagen del mapa desde la URL:", imagenMapa.url);
            imagenMapaActual.style.display = "none";
          };
        } else {
          imagenMapaActual.style.display = "none";
        }
      } else {
        imagenActual.style.display = "none";
        imagenMapaActual.style.display = "none";
      }

      // Categoría: si no está en las opciones, activa "Otros"
      const opciones = Array.from(categoriaSelect.options).map(o => o.value);
      if (opciones.includes(event.category)) {
        categoriaSelect.value = event.category;
        otraCategoriaCampo.style.display = "none";
      } else {
        categoriaSelect.value = "Otros";
        otraCategoriaCampo.style.display = "block";
        otraCategoriaInput.value = event.category;
      }

      // Mapa Leaflet
      const pos = [parseFloat(event.latitude), parseFloat(event.longitude)];
      map = L.map("map").setView(pos, 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      marker = L.marker(pos).addTo(map).bindPopup(event.name).openPopup();

      map.on("click", e => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        latInput.value = lat;
        lonInput.value = lng;

        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng).addTo(map);
        }
      });

      console.log("✅ Evento cargado:", event);
    })
    .catch(err => {
      console.error("❌ Error al cargar evento:", err);
      document.getElementById("errorMensaje").textContent = err.message;
    });

  // Guardar cambios
  document.getElementById("btnGuardarCambios").addEventListener("click", async () => {
    let categoriaFinal = categoriaSelect.value;
    if (categoriaFinal === "Otros") {
      categoriaFinal = otraCategoriaInput.value.trim();
      if (!categoriaFinal) {
        alert("Por favor especifica la categoría.");
        return;
      }
    }

    const precio = parseFloat(precioInput.value);
    if (isNaN(precio) || precio < 0) {
      alert("Por favor ingresa un precio válido.");
      return;
    }

    const datosEvento = {
      id: parseInt(eventId),
      name: document.getElementById("nombreEvento").value,
      description: document.getElementById("descripcionEvento").value,
      startDate: document.getElementById("fechaInicioEvento").value + "T00:00:00",
      endDate: document.getElementById("fechaFinEvento").value + "T00:00:00",
      category: categoriaFinal,
      ticketPrice: precio,
      address: document.getElementById("direccionEvento").value,
      latitude: parseFloat(latInput.value),
      longitude: parseFloat(lonInput.value),
      status: document.getElementById("estadoEvento").value
    };

    const formData = new FormData();
    const imagenNueva = imagenNuevaInput.files[0];
    const mapaNueva = imagenMapaInput?.files?.[0];

    if (imagenNueva) formData.append("file", imagenNueva);
    if (mapaNueva) formData.append("mapFile", mapaNueva);
    formData.append("event", new Blob([JSON.stringify(datosEvento)], { type: "application/json" }));

    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Error al actualizar evento: " + errorText);
      }

      alert("✅ ¡Evento actualizado con éxito!");
      window.location.href = "events.html";
    } catch (error) {
      alert("❌ Error: " + error.message);
      console.error(error);
    }
  });
});
// Botón "Volver al inicio"
document.getElementById("btnVolverInicio").addEventListener("click", () => {
  window.location.href = "events.html"; // Cambia a la ruta correcta de tu página de inicio si es diferente
});
