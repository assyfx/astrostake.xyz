const RPCS = [
  { name: "Official RPC - 0G", url: "https://evmrpc-testnet.0g.ai", active: true, official: true },
  { name: "AstroStake", url: "https://0g-testnet-rpc.astrostake.xyz", active: true, official: false },
  { name: "BANGCODE", url: "https://0g.bangcode.id", active: true, official: false },
  { name: "Grand Valley", url: "https://lightnode-json-rpc-0g.grandvalleys.com", active: true, official: false },
  { name: "ValidatorVN", url: "https://0g-rpc-evm02.validatorvn.com", active: true, official: false },
  { name: "Zstake", url: "https://0g-evm.zstake.xyz/", active: true, official: false },
  { name: "CoreNode Community", url: "https://0g-galileo-evmrpc.corenodehq.xyz/", active: true, official: false },
  { name: "Cryptomolot", url: "https://0g.json-rpc.cryptomolot.com/", active: true, official: false },
  { name: "Maouam Nodelab", url: "https://0g-evm.maouam.nodelab.my.id/", active: true, official: false },
  { name: "CoinssporNodeCenter", url: "https://0g-evmrpc-galileo.coinsspor.com/", active: true, official: false },
  { name: "Komado", url: "https://0g-evmrpc-galileo.komado.xyz/", active: true, official: false },
  { name: "zskw", url: "https://0g.galileo.zskw.xyz/", active: true, official: false },
  { name: "shachopra", url: "https://0g-galileo.shachopra.com/", active: true, official: false },
  { name: "CoreNode Community 2", url: "https://0g-galileo-evmrpc2.corenodehq.xyz/", active: true, official: false },

];

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fungsi copy dengan feedback ikon
function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    // Icon centang
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 13l4 4L19 7" />
      </svg>
    `;
    // Kembalikan ikon copy setelah 1.5 detik
    setTimeout(() => {
      button.innerHTML = copyIcon;
    }, 1500);
  });
}

// Ikon copy untuk inisialisasi tombol
const copyIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
       viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
             M9 5V3h6v2M9 5h6" />
  </svg>
`;

// Fungsi untuk Memformat Angka dengan Koma (Internasional)
function formatBlockNumber(number) {
  return number.toLocaleString('en-US');
}

// Fungsi untuk Update Status dari Backend
async function updateStatusFromBackend() {
  try {
    console.log("Starting Fetch from Backend...");

    const res = await fetch("https://api.astrostake.xyz/last-blocks", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

    if (!res.ok) {
      console.error("❌ Failed to Fetch Data from Backend:", res.status);
      return;
    }

    const data = await res.json();
    console.log("Backend Data:", data);

    document.querySelectorAll(".status-card").forEach(card => {
      const title = card.querySelector(".status-title").textContent;
      const rpcData = data[title];
      if (!rpcData) return;

      console.log(`${title} - Backend Block: ${rpcData.block}`);

      // Block langsung diupdate
      const blockEl = card.querySelector(".status-block");
      if (!blockEl) return;

      const currentBlock = parseInt(blockEl.dataset.block || "0", 10);
      const targetBlock = rpcData.block;

      // Jika block baru lebih besar, animasi
      if (targetBlock > currentBlock) {
        animateBlockNumber(blockEl, currentBlock, targetBlock);
      }

      // Selalu set block langsung dari backend dengan format angka
      blockEl.textContent = `Latest Block: ${formatBlockNumber(targetBlock)}`;

      blockEl.dataset.block = targetBlock; // Selalu update data block

      // Status
      const statusSpan = card.querySelector(".status-status span");
      statusSpan.textContent = rpcData.status;
      statusSpan.className = rpcData.status === "Online" ? "up" : "down";

      // Latency
      card.querySelector(".status-latency span").textContent = `Latency: ${Math.round(rpcData.latency)} ms`;

      // Chain ID
      card.querySelector(".status-chain").textContent = `Chain ID: ${rpcData.chainId}`;

      // Peers
      card.querySelector(".status-peers span").textContent = `Peers: ${rpcData.peers}`;

      // Gas Price (hex → int → format)
      const gasNum = parseInt(rpcData.gasPrice, 16);
      card.querySelector(".status-gas span").textContent = `Gas Price: ${formatNumber(isNaN(gasNum) ? 0 : gasNum)}`;
    });
  } catch (err) {
    console.error("Error fetching backend data:", err);
  }
}

// Fungsi untuk Animasi Block Number
function animateBlockNumber(element, start, end) {
  if (end > start) {
    const duration = 1000; // Durasi animasi 0.8 detik
    const increment = (end - start) / (duration / 16);
    let current = start;

    function updateNumber() {
      current += increment;
      if (current >= end) {
        element.textContent = `Latest Block: ${formatBlockNumber(end)}`;
      } else {
        element.textContent = `Latest Block: ${formatBlockNumber(Math.floor(current))}`;
        requestAnimationFrame(updateNumber);
      }
    }

    requestAnimationFrame(updateNumber);
  } else {
    // Jika block baru lebih kecil atau sama, langsung set tanpa animasi
    element.textContent = `Latest Block: ${formatBlockNumber(end)}`;
  }
}

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
  const labels = [];
  const data = [];
  const colors = [];

  // Filter hanya untuk Chain ID 16601 (untuk chart)
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
  }).filter(item => item !== null);

  // Sort data berdasarkan blockNumber secara descending dan ambil 10 teratas untuk chart
  const sortedData = [...chartData].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 10);

  // Mapping data ke chart
  const filteredLabels = sortedData.map(item => item.title);
  const filteredData = sortedData.map(item => item.blockNumber);
  const filteredColors = sortedData.map(item => item.color);

  blockChart.data.labels = filteredLabels;
  blockChart.data.datasets[0].data = filteredData;
  blockChart.data.datasets[0].backgroundColor = filteredColors;

  const max = Math.max(...filteredData);
  const min = Math.min(...filteredData);

  blockChart.options.scales.y.min = min - 5;
  blockChart.options.scales.y.max = max + 5;

  blockChart.update();
}

function updateBlockChartWithAnimation() {
  const cards = Array.from(document.querySelectorAll('.status-card'));
  const labels = [];
  const data = [];
  const colors = [];

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
  }).filter(item => item !== null);

  const sortedData = [...chartData].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 10);

  const filteredLabels = sortedData.map(item => item.title);
  const filteredData = sortedData.map(item => item.blockNumber);
  const filteredColors = sortedData.map(item => item.color);

  blockChart.data.labels = filteredLabels;
  blockChart.data.datasets[0].data = filteredData;
  blockChart.data.datasets[0].backgroundColor = filteredColors;

  blockChart.options.animation = { duration: 1000, easing: 'easeInOutQuart' };

  const max = Math.max(...filteredData);
  const min = Math.min(...filteredData);

  blockChart.options.scales.y.min = min - 5;
  blockChart.options.scales.y.max = max + 5;

  blockChart.update();
}

function sortCardsByBlock() {
  const container = document.getElementById("team-rpc-container");
  const cards = Array.from(container.querySelectorAll(".status-card"));
  const positions = new Map(cards.map(c => [c, c.getBoundingClientRect()]));

  // Sorting Berdasarkan Chain ID 16601 terlebih dahulu, lalu Latest Block
  const sorted = cards.sort((a, b) => {
    const aChain = a.querySelector(".status-chain").textContent.includes("16601") ? 1 : 0;
    const bChain = b.querySelector(".status-chain").textContent.includes("16601") ? 1 : 0;

    // Prioritaskan Chain ID 16601
    if (aChain > bChain) return -1;
    if (aChain < bChain) return 1;

    // Jika sama-sama 16601, urutkan berdasarkan Latest Block
    const aB = parseInt(a.querySelector(".status-block").dataset.block || "0", 10);
    const bB = parseInt(b.querySelector(".status-block").dataset.block || "0", 10);
    return bB - aB;
  });
  
  sorted.forEach(c => container.appendChild(c));

  sorted.forEach(c => {
    const old = positions.get(c);
    const now = c.getBoundingClientRect();
    const dx = old.left - now.left, dy = old.top - now.top;
    if (dx||dy) {
      c.style.transition = "none";
      c.style.transform = `translate(${dx}px,${dy}px)`;
      requestAnimationFrame(() => {
        c.style.transition = "transform 300ms ease";
        c.style.transform = "";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("team-rpc-container");
  container.innerHTML = "";

  RPCS.forEach(rpc => {
    const wrapper = document.createElement("div");
    wrapper.className = "status-card";
    wrapper.dataset.url = rpc.url;
    wrapper.innerHTML = `
      <div class="status-header">
        <div class="status-title">${rpc.name}</div>
        <button class="rpc-copy" aria-label="Copy RPC URL" title="Copy RPC URL"></button>
      </div>
      <div class="status-line">RPC URL: <a href="#" class="rpc-link" target="_blank">${rpc.url}</a></div>
      <div class="status-line status-chain">Chain ID: -</div>
      <div class="status-line status-status">Status: <span class="down">Offline</span></div>
      <div class="status-line status-block">Latest Block: -</div>
      <div class="status-line status-latency"><span>Latency: -</span></div>
      <div class="status-line status-peers"><span>Peers: -</span></div>
      <div class="status-line status-gas"><span>Gas Price: -</span></div>
    `;
    document.getElementById(rpc.official ? "official-rpc-container" : "team-rpc-container").appendChild(wrapper);

    const copyBtn = wrapper.querySelector(".rpc-copy");
    copyBtn.innerHTML = copyIcon;
    copyBtn.addEventListener("click", () => copyToClipboard(copyBtn, rpc.url));
  });

  initBlockChart();
  updateBlockChart();

  setInterval(() => {
    updateStatusFromBackend();
    updateBlockChart();
	  sortCardsByBlock();
  }, 5000);
});
