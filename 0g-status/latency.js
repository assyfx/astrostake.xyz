let latencyChart;
let latencyData = {}; // Penyimpanan data latency untuk setiap RPC
let labels = []; // Penyimpanan timestamp
let isUpdating = false;
const maxDataPoints = 10; // Maksimal data per RPC (bisa disesuaikan)

function initLatencyChart() {
    const ctx = document.getElementById('latencyChart').getContext('2d');
    latencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [] // Dataset akan ditambahkan dinamis
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Pastikan aspect ratio dimatikan
            animation: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: function(context) {
                        const maxValue = Math.max(...context.chart.data.datasets[0].data);
                        return maxValue > 2000 ? maxValue + 500 : 2000;
                    },
					},
					        title: {
					            display: true,
					            text: 'Latency (ms)'
					        }
					    },
					},
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });

    animateLatencyGraph();
    fetchLatencyFromBackend();
    setInterval(fetchLatencyFromBackend, 3000);
}


// Fungsi untuk Fetch Latency dari Backend
async function fetchLatencyFromBackend() {
    try {
        const response = await fetch("https://astrostake.xyz/last-blocks", {
            method: "GET",
            headers: {
                "Cache-Control": "no-cache"
            }
        });
        const data = await response.json();
        updateLatencyGraph(data);
    } catch (err) {
        console.error("❌ Error fetching latency from backend:", err);
    }
}

// Update Latency Data dengan Auto-Remove Data Lama
function updateLatencyGraph(blockData) {
    const currentTime = new Date().toLocaleTimeString();
    
    // Batas Labels hanya maxDataPoints Data Terbaru
    if (labels.length >= maxDataPoints) labels.shift();
    labels.push(currentTime);

    Object.entries(blockData).forEach(([name, rpcData]) => {
        if (rpcData.status === "Online") {
            if (!latencyData[name]) {
                latencyData[name] = [];
            }

            latencyData[name].push(rpcData.latency || 0);
            if (latencyData[name].length > maxDataPoints) {
                latencyData[name].shift();
            }
        }
    });

    // Update Dataset di Grafik tanpa reset
    latencyChart.data.labels = labels;
    latencyChart.data.datasets = Object.keys(latencyData).map((rpcName, index) => {
        const colors = ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'];
        return {
            label: rpcName,
            data: latencyData[rpcName],
            borderColor: colors[index % colors.length],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.2,
            borderWidth: 2,
            pointRadius: 0, // Tidak ada simbol titik
            pointHoverRadius: 4
        };
    });

    latencyChart.update();
}

// Animasi Smooth menggunakan requestAnimationFrame
function animateLatencyGraph() {
    if (!isUpdating) {
        isUpdating = true;
        requestAnimationFrame(() => {
            latencyChart.update('none');
            isUpdating = false;
            animateLatencyGraph(); // Loop terus tanpa refresh
        });
    }
}

// Initialize Chart on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initLatencyChart();
});
