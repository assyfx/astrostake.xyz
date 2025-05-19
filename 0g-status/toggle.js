// toggle.js

(function() {
  // Ambil elemen tombol dan kontainer
  const btn = document.getElementById("btn-toggle-view");
  const cardsContainer = document.getElementById("team-rpc-container");
  const listContainer = document.getElementById("list-rpc-container");

  // Simpan nilai display default dari kontainer card (grid/flex/block)
  const cardsDefaultDisplay = window.getComputedStyle(cardsContainer).display;

  // Inisialisasi: pastikan card view tampil, list view tersembunyi, dan teks tombol tepat
  listContainer.style.display = "none";
  cardsContainer.style.display = cardsDefaultDisplay;
  btn.textContent = "List View";

  btn.addEventListener("click", () => {
    const listIsVisible = listContainer.style.display === "block";

    if (listIsVisible) {
      // Kembali ke card view
      listContainer.style.display = "none";
      cardsContainer.style.display = cardsDefaultDisplay;
      btn.textContent = "List View";
    } else {
      // Pindah ke list view
      cardsContainer.style.display = "none";
      listContainer.style.display = "block";
      btn.textContent = "Card View";
    }
  });
})();
