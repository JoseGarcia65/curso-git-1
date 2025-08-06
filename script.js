const resultado = document.getElementById('resultado');
const ctx = document.getElementById('grafico').getContext('2d');

const API_KEY = '8895f04f8f01972418450dc216c38cd3';
const URL = `https://api.stlouisfed.org/fred/series/observations?series_id=BAMLH0A0HYM2&api_key=8895f04f8f01972418450dc216c38cd3&file_type=json`;

let grafico;

async function obtenerPrimaRiesgo() {
    try {
        const respuesta = await fetch(URL);
        const datos = await respuesta.json();

        const observaciones = datos.observations.filter(obs => obs.value !== ".");
        const fechas = observaciones.map(obs => obs.date);
        const valores = observaciones.map(obs => parseFloat(obs.value));

        // Mostrar el último valor
        const ultima = observaciones[observaciones.length - 1];
        resultado.innerHTML = `
            <p>Prima de riesgo High Yield: ${parseFloat(ultima.value).toFixed(2)} %</p>
            <p>Última actualización: ${ultima.date}</p>
        `;

        // Si el gráfico ya existe, actualizamos datos
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
        resultado.innerHTML = 'Error al obtener datos de la prima de riesgo.';
        console.error(error);
    }
}

// Ejecutar al inicio y actualizar cada hora
obtenerPrimaRiesgo();
setInterval(obtenerPrimaRiesgo, 3600000);

