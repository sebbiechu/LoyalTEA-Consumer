console.log("✅ app.js loaded on rewards page");

document.addEventListener("DOMContentLoaded", () => {
  const stampGrid = document.getElementById("stampGrid");
  const addStampBtn = document.getElementById("addStampBtn");
  const coffeeReward = document.getElementById("coffeeReward");
  const teaReward = document.getElementById("teaReward");
  const confirmBtn = document.getElementById("confirmRewardBtn");
  const teaStatus = document.getElementById("teaStatus");

  let stamps = 0;
  let teaRedeemed = 0;
  let selectedReward = null;

  function renderStampGrid() {
    if (!stampGrid) return;
    stampGrid.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const img = document.createElement("img");
      img.src = i < stamps ? "images/star-filled.png" : "images/star-empty.png";
      img.className = "stamp-icon";
      stampGrid.appendChild(img);
    }
  }

  function resetRewards() {
    stamps = 0;
    teaRedeemed = 0;
    selectedReward = null;
    coffeeReward?.classList.remove("selected");
    teaReward?.classList.remove("selected");
    updateTeaStatus();
    renderStampGrid();
  }

  function updateTeaStatus() {
    if (teaStatus) {
      if (teaRedeemed === 2) {
        teaStatus.textContent = "✅ Used";
        teaReward.classList.add("disabled");
      } else if (teaRedeemed === 1) {
        teaStatus.textContent = "1 of 2 used";
      } else {
        teaStatus.textContent = "";
        teaReward.classList.remove("disabled");
      }
    }
  }

  if (addStampBtn) {
    addStampBtn.addEventListener("click", () => {
      if (stamps < 9) {
        stamps++;
        renderStampGrid();
        if (stamps === 9) {
          console.log("🎉 Rewards unlocked!");
        }
      }
    });
  }

  if (coffeeReward) {
  coffeeReward.addEventListener("click", () => {
    if (stamps === 9) {
      coffeeReward.classList.add("selected");
      teaReward.classList.remove("selected");
      selectedReward = "coffee";

      confirmBtn.disabled = false;
      confirmBtn.classList.add("active");
    }
  });
}

if (teaReward) {
  teaReward.addEventListener("click", () => {
    if (stamps === 9 && teaRedeemed < 2) {
      teaReward.classList.add("selected");
      coffeeReward.classList.remove("selected");
      selectedReward = "tea";

      confirmBtn.disabled = false;
      confirmBtn.classList.add("active");
    }
  });
}


  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (selectedReward === "coffee") {
        alert("☕ Enjoy your free coffee!");
        resetRewards();
      } else if (selectedReward === "tea") {
        teaRedeemed++;
        alert(`🫖 Enjoy tea ${teaRedeemed} of 2`);
        updateTeaStatus();
        if (teaRedeemed === 2) {
          resetRewards();
        } else {
          selectedReward = null;
          teaReward.classList.remove("selected");
          confirmBtn.disabled = true;
          confirmBtn.classList.remove("active");

        }
      }
    });
  }

  renderStampGrid();
  updateTeaStatus();
});
