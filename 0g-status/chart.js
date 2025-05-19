// block-chart.js

let blockChart;

function initBlockChart() {
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue('--accent').trim();
  const textColor = style.getPropertyValue('--text').trim();
  const borderColor = style.getPropertyValue('--border').trim();

  const ctx = document.getElementById('blockChart').getContext('2d');
  blockChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Latest Block',
        data: [],
        backgroundColor: accent,
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            generateLabels: function(chart) {
              return [
                {
                  text: 'Up-to-date',
                  fillStyle: '#4d61ff',
                  strokeStyle: '#4d61ff',
                  lineWidth: 1,
                  fontColor: textColor,
                  font: { color: textColor }
                },
                {
                  text: 'Lagging >1 blocks',
                  fillStyle: '#facc15',
                  strokeStyle: '#facc15',
                  lineWidth: 1,
                  fontColor: textColor,
                  font: { color: textColor }
                },
              ];
            }
          }
        },        
        title: {
          display: true,
          text: 'RPC Block Height',
          color: textColor,
          font: { size: 18, family: 'Inter' }
        },
        tooltip: {
          callbacks: {
            label: ctx => ctx.raw ? `Block: ${ctx.raw.toLocaleString()}` : 'Offline'
          }
        },
        datalabels: {
          color: textColor,
          anchor: 'end',
          align: 'start',
          formatter: value => value > 0 ? value.toLocaleString() : 'Offline'
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 12 }, maxRotation: 45 },
          grid: { color: borderColor }
        },
        y: {
          beginAtZero: false,
          ticks: {
            color: textColor,
            callback: val => val.toLocaleString()
          },
          grid: { color: borderColor }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function updateBlockChart() {
  const cards = Array.from(document.querySelectorAll('.status-card'));
  const chartData = cards.map(card => {
    const chainText = card.querySelector('.status-chain').textContent;
    if (chainText.includes("16601")) {
      const title = card.querySelector('.status-title').textContent;
      const txt = card.querySelector('.status-block').textContent;
      const m = txt.match(/Latest Block:\s*([\d,]+)/);
      const blockNumber = m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
      return { title, blockNumber, color: '#4d61ff' };
    }
    return null;
  }).filter(Boolean);

  const sortedData = chartData.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 10);

  blockChart.data.labels = sortedData.map(i => i.title);
  blockChart.data.datasets[0].data = sortedData.map(i => i.blockNumber);
  blockChart.data.datasets[0].backgroundColor = sortedData.map(i => i.color);

  const max = Math.max(...blockChart.data.datasets[0].data);
  const min = Math.min(...blockChart.data.datasets[0].data);

  blockChart.options.scales.y.min = min - 5;
  blockChart.options.scales.y.max = max + 5;

  blockChart.update();
}

document.addEventListener("DOMContentLoaded", () => {
  initBlockChart();
  updateBlockChart();
  setInterval(updateBlockChart, 5000);
});
