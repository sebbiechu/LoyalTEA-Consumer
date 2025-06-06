const stampGrid = document.getElementById("stampGrid");
const addStampBtn = document.getElementById("addStampBtn");
const rewardSection = document.getElementById("rewardSection");
const coffeeReward = document.getElementById("coffeeReward");
const teaReward = document.getElementById("teaReward");

let stamps = 0;
let teaRedeemed = 0;

function renderStampGrid() {
  stampGrid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const img = document.createElement("img");
    img.src = i < stamps ? "images/star-filled.png" : "images/star-empty.png";
    img.className = "stamp-icon";
    stampGrid.appendChild(img);
  }
}

function showRewardOptions() {
  rewardSection.classList.remove("hidden");
}

function resetStamps() {
  stamps = 0;
  teaRedeemed = 0;
  rewardSection.classList.add("hidden");
  renderStampGrid();
}

addStampBtn.addEventListener("click", () => {
  if (stamps < 9) {
    stamps++;
    renderStampGrid();
    if (stamps === 9) {
      showRewardOptions();
    }
  }
});

coffeeReward.addEventListener("click", () => {
  if (stamps === 9) {
    alert("Enjoy your free coffee! ☕");
    resetStamps();
  }
});

teaReward.addEventListener("click", () => {
  if (stamps === 9 && teaRedeemed < 2) {
    teaRedeemed++;
    alert(`Enjoy tea ${teaRedeemed} of 2 🫖`);
    if (teaRedeemed === 2) {
      resetStamps();
    }
  }
});

// Initial UI load
renderStampGrid();