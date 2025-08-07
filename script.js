<iframe src="https://fred.stlouisfed.org/graph/graph-landing.php?g=1Lc8Z&width=470&height=300" scrolling="yes" frameborder="0" style="overflow:hidden; width:670px; height:525px;" allowTransparency="true" loading="lazy"></iframe>

const resultado = document.getElementById('resultado');
const ctx = document.getElementById('grafico').getContext('2d');
let grafico;

const API_KEY = '8895f04f8f01972418450dc216c38cd3'; // Reemplaza con tu API Key de FRED
const URL_FRED = `https://api.stlouisfed.org/fred/series/observations?series_id=BAMLH0A0HYM2&api_key=${API_KEY}&file_type=json`;
const URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(URL_FRED)}`;

async function obtenerPrimaRiesgo() {
    try {
        const respuesta = await fetch(URL);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const datos = await respuesta.json();
        if (!datos.observations) throw new Error('No se recibieron datos.');

        const observaciones = datos.observations.filter(obs => obs.value !== ".");
        const fechas = observaciones.map(obs => obs.date);
        const valores = observaciones.map(obs => parseFloat(obs.value));

        const ultima = observaciones[observaciones.length - 1];

        // Mostrar la última prima de riesgo
        resultado.innerHTML = `
            <p>Prima de riesgo High Yield: <strong>${parseFloat(ultima.value).toFixed(2)} %</strong></p>
            <p>Última actualización: ${ultima.date}</p>
        `;

        // Crear o actualizar el gráfico
        if (grafico) {
            grafico.data.labels = fechas;
            grafico.data.datasets[0].data = valores;
            grafico.update();
        } else {
            grafico = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: fechas,
                    datasets: [{
                        label: 'Prima de riesgo (%)',
                        data: valores,
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            ticks: { maxTicksLimit: 10 }
                        },
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }
    } catch (error) {
        resultado.innerHTML = '⚠️ Error al obtener datos de la prima de riesgo.';
        console.error('Detalles del error:', error);
    }
}

// Ejecutar al cargar
obtenerPrimaRiesgo();

// Actualizar cada hora
setInterval(obtenerPrimaRiesgo, 3600000);
