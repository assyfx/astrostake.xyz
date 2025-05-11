const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 3011;

app.use(cors());
app.use(express.json());

// Daftar RPC yang Dipantau
const RPCS = [
  { name: "AstroStake", url: "https://0g-testnet-rpc.astrostake.xyz" },
  { name: "BANGCODE", url: "https://0g.bangcode.id" },
  { name: "Grand Valley", url: "https://lightnode-json-rpc-0g.grandvalleys.com" },
  { name: "ValidatorVN", url: "https://0g-rpc-evm02.validatorvn.com" },
  { name: "Zstake", url: "https://0g-evm.zstake.xyz/" },
  { name: "CoreNode Community", url: "https://0g-galileo-evmrpc.corenodehq.xyz/" },
  { name: "Cryptomolot", url: "https://0g.json-rpc.cryptomolot.com/" },
  { name: "Official RPC - 0G", url: "https://evmrpc-testnet.0g.ai" }
];

// Cache untuk Block Terbaru
let cachedBlocks = {};
let fetchInterval = 5000; // 5 detik (default)

// Fungsi untuk Fetch Data dari RPC
async function fetchRPCBlocks() {
  console.log(`🔄 Fetching Latest Blocks from RPC...`);

  for (const rpc of RPCS) {
    try {
      const start = Date.now();
      const response = await axios.post(rpc.url, {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      });

      const latency = Date.now() - start;
      const blockNumberHex = response.data?.result;
      const blockNumber = blockNumberHex ? parseInt(blockNumberHex, 16) : NaN;

      // Fetch data tambahan
      const chainId = await getChainId(rpc.url);
      const peers = await getPeers(rpc.url);
      const gasPrice = await getGasPrice(rpc.url);

      // Simpan data ke cache dengan pengecekan lebih ketat
      cachedBlocks[rpc.name] = {
        status: !isNaN(blockNumber) ? "Online" : "Offline",
        block: !isNaN(blockNumber) ? blockNumber : cachedBlocks[rpc.name]?.block || "Unknown",
        latency: !isNaN(latency) ? latency : cachedBlocks[rpc.name]?.latency || 0,
        chainId: chainId || cachedBlocks[rpc.name]?.chainId || null,
        peers: !isNaN(peers) ? peers : cachedBlocks[rpc.name]?.peers || 0,
        gasPrice: gasPrice ? gasPrice : cachedBlocks[rpc.name]?.gasPrice || "0"
      };

      console.log(`✅ ${rpc.name} - Block: ${cachedBlocks[rpc.name].block} | Latency: ${cachedBlocks[rpc.name].latency}ms | Peers: ${cachedBlocks[rpc.name].peers} | Gas Price: ${cachedBlocks[rpc.name].gasPrice}`);
    } catch (error) {
      console.error(`❌ Error fetching block from ${rpc.name}:`, error.message);
      cachedBlocks[rpc.name] = {
        status: "Offline",
        block: cachedBlocks[rpc.name]?.block || "Unknown",
        latency: 0,
        chainId: cachedBlocks[rpc.name]?.chainId || null,
        peers: cachedBlocks[rpc.name]?.peers || 0,
        gasPrice: cachedBlocks[rpc.name]?.gasPrice || "0"
      };
    }
  }
}

// Fungsi untuk Fetch Data Chain ID
async function getChainId(rpcUrl) {
  try {
    const response = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "eth_chainId",
      params: [],
      id: 1
    });
    return parseInt(response.data?.result, 16) || null;
  } catch {
    return null;
  }
}

// Fungsi untuk Fetch Peers
async function getPeers(rpcUrl) {
  try {
    const response = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "net_peerCount",
      params: [],
      id: 1
    });
    const peers = parseInt(response.data?.result, 16);
    return !isNaN(peers) ? peers : 0;
  } catch {
    return 0;
  }
}

// Fungsi untuk Fetch Gas Price
async function getGasPrice(rpcUrl) {
  try {
    const response = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    });
    return response.data?.result || "0";
  } catch {
    return "0";
  }
}


// Endpoint untuk User Mengambil Data dari Cache
app.get("/last-blocks", (req, res) => {
  res.json(cachedBlocks);
});

// Jalankan Fetch Pertama dan Set Interval Fetch
fetchRPCBlocks();
setInterval(fetchRPCBlocks, fetchInterval);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`✅ RPC Block backend running on port ${PORT}`);
});
