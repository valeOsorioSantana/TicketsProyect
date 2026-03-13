const categorias = ["eventos", "tickets", "registros", "usuarios", "pagos"];

const preguntas = [
    // Eventos
    { texto: "¿Cuándo es el próximo evento?", categoria: "eventos" },
    { texto: "¿Dónde se realiza el concierto?", categoria: "eventos" },
    { texto: "Muéstrame los eventos disponibles", categoria: "eventos" },
    { texto: "Calendario de próximos conciertos", categoria: "eventos" },
    { texto: "Lista de eventos de esta semana", categoria: "eventos" },
    { texto: "¿Qué eventos se harán en la ciudad?", categoria: "eventos" },
    { texto: "Lista de conciertos y festivales", categoria: "eventos" },
    { texto: "Eventos deportivos de hoy", categoria: "eventos" },
    { texto: "Agenda cultural del mes", categoria: "eventos" },
    { texto: "Conciertos y actividades artísticas", categoria: "eventos" },

    // Tickets
    { texto: "Quiero comprar un ticket", categoria: "tickets" },
    { texto: "¿Cómo adquiero boletos?", categoria: "tickets" },
    { texto: "Precio de los tickets para el evento", categoria: "tickets" },
    { texto: "Disponibilidad de entradas", categoria: "tickets" },
    { texto: "Comprar boletos online", categoria: "tickets" },
    { texto: "Boletos para el concierto", categoria: "tickets" },

    // Registros
    { texto: "Deseo registrarme para la conferencia", categoria: "registros" },
    { texto: "Formulario de registro para el taller", categoria: "registros" },
    { texto: "¿Cómo me registro en la plataforma?", categoria: "registros" },
    { texto: "Registro de nuevos usuarios", categoria: "registros" },
    { texto: "Crear perfil para un curso", categoria: "registros" },
    { texto: "Inscripción a la capacitación", categoria: "registros" },
    { texto: "Formulario de inscripción", categoria: "registros" },

    // Usuarios
    { texto: "Olvidé mi contraseña, ¿cómo la recupero?", categoria: "usuarios" },
    { texto: "Quiero actualizar mi perfil de usuario", categoria: "usuarios" },
    { texto: "Cambiar mi dirección de correo", categoria: "usuarios" },
    { texto: "Modificar información de mi cuenta", categoria: "usuarios" },
    { texto: "Actualizar número de teléfono", categoria: "usuarios" },
    { texto: "Configurar preferencias de usuario", categoria: "usuarios" },

    // Pagos
    { texto: "¿Cómo realizo un pago?", categoria: "pagos" },
    { texto: "No se procesó mi pago", categoria: "pagos" },
    { texto: "Mostrar historial de transacciones", categoria: "pagos" },
    { texto: "Cancelar mi suscripción", categoria: "pagos" },
    { texto: "Confirmación de pago recibido", categoria: "pagos" },
    { texto: "Problema con la tarjeta de crédito", categoria: "pagos" },
];

let useModel;
let embeddingsPreguntas;

// Palabras clave para reforzar cada categoría
const palabrasClave = {
    eventos: ["evento", "concierto", "festival", "agenda", "actividad", "programación"],
    tickets: ["ticket", "boleto", "entrada", "compra", "precio"],
    registros: ["registro", "inscripción", "formulario", "crear perfil", "nuevo usuario"],
    usuarios: ["contraseña", "perfil", "usuario", "cuenta", "correo", "información"],
    pagos: ["pago", "tarjeta", "suscripción", "transacción", "historial"]
};

// Preprocesamiento de texto
function preprocesar(texto) {
    return texto
        .toLowerCase()
        .replace(/\b(mi|para|cómo|quiero|necesito|por favor|de|el|la|los|las)\b/g, "")
        .trim();
}

async function init() {
    console.log("Cargando USE...");
    useModel = await use.load();
    console.log("USE cargado.");

    const textos = preguntas.map(p => preprocesar(p.texto));
    embeddingsPreguntas = await useModel.embed(textos);
    console.log("Embeddings de preguntas calculados.");
}

function cosineSim(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function obtenerCategoriaKNN(similitudes, k = 5) {
    const indicesOrdenados = similitudes
        .map((sim, i) => [sim, i])
        .sort((a, b) => b[0] - a[0])
        .map(x => x[1]);
    const vecinos = indicesOrdenados.slice(0, k);

    const votos = {};
    vecinos.forEach(i => {
        const cat = preguntas[i].categoria;
        votos[cat] = (votos[cat] || 0) + 1;
    });

    return Object.keys(votos).reduce((a, b) => votos[a] >= votos[b] ? a : b);
}

async function predecir() {
    const texto = document.getElementById("pregunta").value;
    if (!texto) return alert("Escribe una pregunta");

    const textoProcesado = preprocesar(texto);
    const embeddingNuevo = await useModel.embed([textoProcesado]);
    const embArray = await embeddingsPreguntas.array();
    const embNuevo = await embeddingNuevo.array();

    let similitudes = embArray.map(e => cosineSim(e, embNuevo[0]));

    // Refuerzo con palabras clave
    Object.keys(palabrasClave).forEach(cat => {
        palabrasClave[cat].forEach(palabra => {
            if (textoProcesado.includes(palabra)) {
                similitudes = similitudes.map((sim, i) => {
                    if (preguntas[i].categoria === cat) return sim + 0.1; // aumenta similitud para coincidencias
                    return sim;
                });
            }
        });
    });

    // Umbral opcional
    const maxSim = Math.max(...similitudes);
    let categoria = obtenerCategoriaKNN(similitudes, 5);
    if (maxSim < 0.6) categoria = "Intención no clara";

    document.getElementById("resultado").innerText = `Intención predicha: ${categoria}`;
}

init();
