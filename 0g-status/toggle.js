// toggle.js

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-toggle-view");
  const cardsContainer = document.getElementById("team-rpc-container");
  const listContainer = document.getElementById("list-rpc-container");
  // Capture original display style of cardsContainer
  const cardsDefaultDisplay = window.getComputedStyle(cardsContainer).display;

  // Function to update button text and Freeze button visibility
  function updateViewState() {
    const listVisible = window.getComputedStyle(listContainer).display !== "none";
    const freezeBtn = document.getElementById("freeze-btn");
    if (listVisible) {
      btn.textContent = "Card View";
      if (freezeBtn) freezeBtn.style.display = "none";
    } else {
      btn.textContent = "List View";
      if (freezeBtn) freezeBtn.style.display = "block";
    }
  }

  // Initial setup: show cards, hide list
  cardsContainer.style.display = cardsDefaultDisplay;
  listContainer.style.display = "none";
  updateViewState();

  // Toggle handler
  btn.addEventListener("click", () => {
    const listVisible = window.getComputedStyle(listContainer).display !== "none";

    if (listVisible) {
      // Switch to cards
      listContainer.style.display = "none";
      cardsContainer.style.display = cardsDefaultDisplay;
    } else {
      // Switch to list
      cardsContainer.style.display = "none";
      listContainer.style.display = "block";
    }
    updateViewState();
  });
});
