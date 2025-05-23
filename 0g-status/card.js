// status-card.js

window.RPCS = [
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
  { name: "Validator247", url: "http://0g-galileo-evm-rpc.validator247.com/", active: true, official: false },
  { name: "VjnNodes", url: "https://evmrpc.vinnodes.com/", active: true, official: false },
  { name: "ferdimanaa", url: "https://0g-galileo-ferdimanaa.xyz/", active: true, official: false },
  { name: "xAthzid", url: "https://0g-galileo.xzid.xyz/", active: true, official: false },
  { name: "Zeycan", url: "https://0g-evm-rpc.zeycanode.com/", active: true, official: false },
  { name: "AJPanda", url: "https://rpc-galileo.ajpanda.com/", active: true, official: false },
  { name: "Obiwankenobi", url: "https://evm-rpc-0g.obiwank107.xyz/", active: true, official: false },
  { name: "Langitz", url: "https://0g-galileo.langitz.xyz/", active: true, official: false },
  { name: "Sr20de", url: "https://0g-evmrpc.sr20de.xyz/", active: true, official: false },
  { name: "Shayneval", url: "https://evm-rpc-shayneval.xyz/", active: true, official: false }
];

// Format numbers with thousands separators
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Copy RPC URL to clipboard and show temporary check icon
function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    button.innerHTML = checkIcon;
    setTimeout(() => {
      button.innerHTML = copyIcon;
    }, 1500);
  });
}

// Icons for copy button
const copyIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
       viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
             M9 5V3h6v2M9 5h6" />
  </svg>
`;

const checkIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
       viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 13l4 4L19 7" />
  </svg>
`;

// Format block numbers with locale string
function formatBlockNumber(number) {
  return number.toLocaleString('en-US');
}

// Fetch latest status and update cards
async function updateStatusFromBackend() {
  try {
    const res = await fetch("https://api.astrostake.xyz/last-blocks", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

    if (!res.ok) return;

    const data = await res.json();

    document.querySelectorAll(".status-card").forEach(card => {
      const title = card.querySelector(".status-title").textContent;
      const rpcData = data[title];
      if (!rpcData) return;

      const blockEl = card.querySelector(".status-block");
      const currentBlock = parseInt(blockEl.dataset.block || "0", 10);
      const targetBlock = rpcData.block;

      if (targetBlock > currentBlock) {
        animateBlockNumber(blockEl, currentBlock, targetBlock);
      }

      blockEl.textContent = `Latest Block: ${formatBlockNumber(targetBlock)}`;
      blockEl.dataset.block = targetBlock;

      const statusSpan = card.querySelector(".status-status span");
      statusSpan.textContent = rpcData.status;
      statusSpan.className = rpcData.status === "Online" ? "up" : "down";

      card.querySelector(".status-latency span").textContent = `Latency: ${Math.round(rpcData.latency)} ms`;
      card.querySelector(".status-chain").textContent = `Chain ID: ${rpcData.chainId}`;
      card.querySelector(".status-peers span").textContent = `Peers: ${rpcData.peers}`;

      const gasNum = parseInt(rpcData.gasPrice, 16);
      card.querySelector(".status-gas span").textContent = `Gas Price: ${formatNumber(isNaN(gasNum) ? 0 : gasNum)}`;
    });
  } catch (err) {
    console.error("Error fetching backend data:", err);
  }
}

// Animate the block number increase
function animateBlockNumber(element, start, end) {
  const duration = 1000;
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
}

// Flag for freezing the sorted view
let freezeSorting = false;

// Sort cards by block, unless frozen
function sortCardsByBlock() {
  if (freezeSorting) return;

  const container = document.getElementById("team-rpc-container");
  if (!container) return;

  const cards = Array.from(container.querySelectorAll(".status-card"));
  const positions = new Map(cards.map(c => [c, c.getBoundingClientRect()]));

  const sorted = cards.sort((a, b) => {
    const aChain = a.querySelector(".status-chain").textContent.includes("16601") ? 1 : 0;
    const bChain = b.querySelector(".status-chain").textContent.includes("16601") ? 1 : 0;

    if (aChain > bChain) return -1;
    if (aChain < bChain) return 1;

    const aB = parseInt(a.querySelector(".status-block").dataset.block || "0", 10);
    const bB = parseInt(b.querySelector(".status-block").dataset.block || "0", 10);
    return bB - aB;
  });

  sorted.forEach(c => container.appendChild(c));

  // Animate sort transition
  sorted.forEach(c => {
    const oldPos = positions.get(c);
    const newPos = c.getBoundingClientRect();
    const dx = oldPos.left - newPos.left;
    const dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.style.transition = "none";
      c.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        c.style.transition = "transform 300ms ease";
        c.style.transform = "";
      });
    }
  });
}

// Initialize dashboard on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("team-rpc-container");
  if (!container) {
    console.error("Container with id 'team-rpc-container' not found.");
    return;
  }
  container.innerHTML = "";

  // Add Freeze View toggle button
  const freezeBtn = document.createElement("button");
  freezeBtn.id = "freeze-btn";
  freezeBtn.textContent = "Freeze View";
  freezeBtn.style = "display: block; margin: 0.5rem auto;";
  freezeBtn.addEventListener("click", () => {
    freezeSorting = !freezeSorting;
    freezeBtn.textContent = freezeSorting ? "Unfreeze View" : "Freeze View";
  });
  container.parentNode.insertBefore(freezeBtn, container);

  // Build cards
  RPCS.forEach(rpc => {
    const wrapper = document.createElement("div");
    wrapper.className = "status-card";
    wrapper.dataset.url = rpc.url;
    wrapper.innerHTML = `
      <div class="status-header">
        <div class="status-title">${rpc.name}</div>
        <button class="rpc-copy" aria-label="Copy RPC URL"></button>
      </div>
      <div class="status-line">RPC URL: <a href="${rpc.url}" class="rpc-link" target="_blank">${rpc.url}</a></div>
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

  updateStatusFromBackend();
  sortCardsByBlock();

  setInterval(() => {
    updateStatusFromBackend();
    sortCardsByBlock();
  }, 5000);
});
