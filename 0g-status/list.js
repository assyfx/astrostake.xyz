// list.js

(function() {
  const API_URL = "https://api.astrostake.xyz/last-blocks";
  let currentSort = { key: null, asc: true };

  // helper untuk format angka ribuan
  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  // render tabel list view beserta kontrol sort dan rows
  function renderListView() {
    const container = document.getElementById("list-rpc-container");
    container.innerHTML = "";

    // Kontrol sorting
    const controls = document.createElement("div");
    controls.className = "list-sort-controls";
    controls.innerHTML = `
      <button id="btn-sort-height" class="sort-btn">Sort by Block Height</button>
      <button id="btn-sort-latency" class="sort-btn">Sort by Latency</button>
    `;
    container.appendChild(controls);

    // Buat tabel
    const table = document.createElement("table");
    table.className = "rpc-list-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>RPC Name</th>
          <th>URL</th>
          <th>Status</th>
          <th>Network Height</th>
          <th>Latency (ms)</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    container.appendChild(table);

    // Render rows awal
    const tbody = table.querySelector('tbody');
    RPCS.forEach(rpc => {
      const tr = document.createElement('tr');
      tr.classList.add("rpc-row");
      tr.innerHTML = `
        <td>${rpc.name}</td>
        <td><a href="${rpc.url}" target="_blank">${rpc.url}</a></td>
        <td class="status-cell"><span class="down">-</span></td>
        <td class="height-cell">-</td>
        <td class="latency-cell">-</td>
      `;
      tbody.appendChild(tr);
    });

    // Tambahkan event listener untuk sort
    document.getElementById("btn-sort-height").addEventListener("click", () => {
      currentSort.key = "height";
      currentSort.asc = !currentSort.asc;
      sortRows();
    });

    document.getElementById("btn-sort-latency").addEventListener("click", () => {
      currentSort.key = "latency";
      currentSort.asc = !currentSort.asc;
      sortRows();
    });
  }

  // fungsi untuk mengurutkan baris dengan animasi
  function sortRows() {
    const tbody = document.querySelector("#list-rpc-container tbody");
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (!currentSort.key) return;

    rows.sort((a, b) => {
      const aText = a.querySelector(`.${currentSort.key}-cell`).textContent.replace(/,/g, '');
      const bText = b.querySelector(`.${currentSort.key}-cell`).textContent.replace(/,/g, '');
      const aVal = parseFloat(aText) || 0;
      const bVal = parseFloat(bText) || 0;

      if (currentSort.key === 'latency') {
        const aOffline = a.querySelector('.status-cell span').classList.contains('down') ? 1 : 0;
        const bOffline = b.querySelector('.status-cell span').classList.contains('down') ? 1 : 0;
        if (aOffline !== bOffline) return aOffline - bOffline;
      }

      return currentSort.asc ? aVal - bVal : bVal - aVal;
    });

    // Tambahkan animasi saat urutkan ulang
    tbody.style.transition = "opacity 0.3s";
    tbody.style.opacity = 0.5;
    setTimeout(() => {
      rows.forEach(r => tbody.appendChild(r));
      tbody.style.opacity = 1;
    }, 200);
  }

  // fetch data dan update tabel
  async function updateListStatus() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const tbody = document.querySelector("#list-rpc-container tbody");
      document.querySelectorAll("#list-rpc-container tbody tr").forEach(row => {
        const name = row.children[0].textContent;
        const rpcData = data[name];
        if (!rpcData) return;

        // update network height dan latency
        row.querySelector(".height-cell").textContent = formatNumber(rpcData.block);
        row.querySelector(".latency-cell").textContent = Math.round(rpcData.latency);

        // update status
        const span = row.querySelector(".status-cell span");
        const isOnline = rpcData.status === "Online";
        span.textContent = isOnline ? "Online" : "Offline";
        span.className = isOnline ? "up" : "down";
      });

      // reorder: online di atas offline
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const aOnline = a.querySelector('.status-cell span').classList.contains('up') ? 0 : 1;
        const bOnline = b.querySelector('.status-cell span').classList.contains('up') ? 0 : 1;
        return aOnline - bOnline;
      });
      rows.forEach(r => tbody.appendChild(r));

      // jika ada sorting aktif, apply
      if (currentSort.key) sortRows();

    } catch (err) {
      console.error("Error updating list view:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderListView();
    updateListStatus();
    setInterval(updateListStatus, 5000);
  });
})();
