const resultado = document.getElementById('resultado');
const ctx = document.getElementById('grafico').getContext('2d');
let grafico;

const API_KEY = 'TU_API_KEY'; // Pon aquí tu API Key de FRED

// Series a mostrar
const SERIES = [
    { id: 'BAMLH0A0HYM2', nombre: 'High Yield total', color: 'blue' },
    { id: 'BAMLH0A2HYBB', nombre: 'BB', color: 'green' },
    { id: 'BAMLH0A3HYB', nombre: 'B', color: 'orange' },
    { id: 'BAMLH0A4HYC', nombre: 'CCC', color: 'red' }
];

// Función para obtener datos de una serie
async function obtenerSerie(id) {
    const urlFRED = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json`;
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlFRED)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
    const datos = await resp.json();
    const observaciones = datos.observations.filter(obs => obs.value !== ".");
    return observaciones.map(obs => ({
        fecha: obs.date,
        valor: parseFloat(obs.value)
    }));
}

// Función principal
async function cargarDatos() {
    try {
        resultado.textContent = 'Cargando datos de FRED...';
        const datosSeries = await Promise.all(SERIES.map(s => obtenerSerie(s.id)));

        // Fechas comunes (usamos la primera serie como referencia)
        const fechas = datosSeries[0].map(d => d.fecha);

        // Crear datasets para Chart.js
        const datasets = SERIES.map((serie, idx) => ({
            label: serie.nombre,
            data: datosSeries[idx].map(d => d.valor),
            borderColor: serie.color,
            borderWidth: 2,
            fill: false,
            tension: 0.1
        }));

        // Mostrar últimas primas de riesgo
        const resumen = SERIES.map((s, idx) => {
            const ultima = datosSeries[idx][datosSeries[idx].length - 1];
            return `${s.nombre}: ${ultima.valor.toFixed(2)}% (${ultima.fecha})`;
        }).join('<br>');
        resultado.innerHTML = `<strong>Últimas primas de riesgo:</strong><br>${resumen}`;

        // Dibujar gráfico
        if (grafico) {
            grafico.data.labels = fechas;
            grafico.data.datasets = datasets;
            grafico.update();
        } else {
            grafico = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: fechas,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { ticks: { maxTicksLimit: 10 } },
                        y: { beginAtZero: false }
                    }
                }
            });
        }

    } catch (error) {
        resultado.innerHTML = '⚠️ Error al obtener datos de la API. Se muestra iframe de FRED más abajo.';
        console.error('Error al obtener datos:', error);
    }
}

// Cargar al inicio
cargarDatos();

// Actualizar cada hora
setInterval(cargarDatos, 3600000);
